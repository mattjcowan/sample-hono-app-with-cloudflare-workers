import { Hono } from 'hono'
import { z } from 'zod'
import { Todo } from './types'
import { landingPageHandler } from './handlers/landingPageHandler'

// Define types
type Bindings = {
  DB: D1Database
  TODO_CACHE: KVNamespace
  CF_IMAGES_ACCOUNT_ID: string
  CF_IMAGES_API_TOKEN: string
  CF_IMAGES_ACCOUNT_HASH: string
}

// Create schema for validation
const todoSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  // imageId can be string of any length, null, or undefined
  imageId: z.string().nullish()
})

// Create app
const app = new Hono<{ Bindings: Bindings }>()

// Cache key
const CACHE_KEY = 'todos-list'

// Helper to invalidate cache
async function invalidateCache(kv: KVNamespace) {
  await kv.delete(CACHE_KEY)
}

app.get('/', (c) => {
  return landingPageHandler(c)
});

// GET all todos
app.get('/todos', async (c) => {
  // Try to get from cache first
  const cached = await c.env.TODO_CACHE.get(CACHE_KEY)
  if (cached) {
    return c.json(JSON.parse(cached))
  }

  // If not in cache, get from DB
  const { results } = await c.env.DB
    .prepare('SELECT * FROM todos ORDER BY created_at DESC')
    .all<Todo>()

  // Update cache
  await c.env.TODO_CACHE.put(CACHE_KEY, JSON.stringify(results))

  return c.json(results)
})

// GET single todo
app.get('/todos/:id', async (c) => {
  const id = c.req.param('id')
  const todo = await c.env.DB
    .prepare('SELECT * FROM todos WHERE id = ?')
    .bind(id)
    .first<Todo>()

  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  return c.json(todo)
})

// POST new todo
app.post('/todos', async (c) => {
  try {
    const body = await c.req.json()

    const validatedData = todoSchema.parse({
      title: body.title,
      summary: body.summary,
      imageId: body.imageId
    })

    const { success } = await c.env.DB
      .prepare('INSERT INTO todos (title, summary, imageId) VALUES (?, ?, ?)')
      .bind(validatedData.title, validatedData.summary, validatedData.imageId)
      .run()

    if (success) {
      // Invalidate cache
      await invalidateCache(c.env.TODO_CACHE)
      return c.json({ message: 'Todo created successfully' }, 201)
    }

    return c.json({ error: 'Failed to create todo' }, 500)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error);
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// PUT update todo
app.put('/todos/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const validatedData = todoSchema.parse(body)

    const { success } = await c.env.DB
      .prepare('UPDATE todos SET title = ?, summary = ? WHERE id = ?')
      .bind(validatedData.title, validatedData.summary, id)
      .run()

    if (success) {
      // Invalidate cache
      await invalidateCache(c.env.TODO_CACHE)
      return c.json({ message: 'Todo updated successfully' })
    }

    return c.json({ error: 'Todo not found' }, 404)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// DELETE todo
app.delete('/todos/:id', async (c) => {
  const id = c.req.param('id')

  const { success } = await c.env.DB
    .prepare('DELETE FROM todos WHERE id = ?')
    .bind(id)
    .run()

  if (success) {
    // Invalidate cache
    await invalidateCache(c.env.TODO_CACHE)
    return c.json({ message: 'Todo deleted successfully' })
  }

  return c.json({ error: 'Todo not found' }, 404)
})

// POST upload image
app.post('/upload-image', async (c) => {
  try {
    // Get the form data using Hono's built-in form parser
    const formData = await c.req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'File not provided or invalid' }, 400)
    }

    // Create a new FormData instance for the Cloudflare API request
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    const accountId = c.env.CF_IMAGES_ACCOUNT_ID
    const apiToken = c.env.CF_IMAGES_API_TOKEN

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`
      },
      body: uploadFormData
    })

    const data: any = await response.json()

    if (!response.ok) {
      console.error('Cloudflare Images API Error:', data)
      return c.json({ error: 'Failed to upload image' }, response.status)
    }

    return c.json(data)
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app