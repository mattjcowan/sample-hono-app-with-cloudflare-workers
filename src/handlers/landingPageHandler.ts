import { Context } from 'hono'
// import { html } from 'hono/html'

export function landingPageHandler(c: Context) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo List Manager</title>
        <script src="https://cdn.tailwindcss.com/3.4.16"></script>
    </head>
    <body class="bg-gray-100 p-8">
        <div class="max-w-4xl mx-auto">
        
            <div class="px-6 py-12 sm:px-6 sm:py-12 lg:px-8">
                <div class="mx-auto max-w-2xl text-center">
                    <h1 class="text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Todo List Manager</h1>
                    <p class="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-600">Sample app using 
                        <a href="https://hono.dev/" target="_blank">
                            <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Hono</span>
                        </a>,
                        <a href="https://developers.cloudflare.com/workers/" target="_blank">
                            <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Cloudflare (CF) Workers</span>
                        </a>, 
                        <a href="https://developers.cloudflare.com/kv/" target="_blank">
                            <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">CF KV</span>
                        </a>, 
                        <a href="https://developers.cloudflare.com/d1/" target="_blank">
                            <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">CF D1</span>
                        </a>, and 
                        <a href="https://developers.cloudflare.com/images/" target="_blank">
                            <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">CF Images</span>
                        </a>.
                    </p>
                </div>
            </div>
            
            <!-- Add Todo Form -->
            <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 class="text-xl font-semibold mb-4">Add New Todo</h2>
                <form id="addTodoForm" class="space-y-4">
                    <div>
                        <label for="newTitle" class="block text-sm/6 font-medium text-gray-900">Title</label>
                        <div class="mt-2">
                            <input type="text" name="newTitle" id="newTitle" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" placeholder="Todo item title">
                        </div>
                    </div>
                    <div>
                        <label for="newSummary" class="block text-sm/6 font-medium text-gray-900">Summary</label>
                        <div class="mt-2">
                            <textarea rows="3" name="newSummary" id="newSummary" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" placeholder="Todo item summary"></textarea>
                        </div>
                    </div>
                    <div>
                        <label for="todoImage" class="block text-sm/6 font-medium text-gray-900">Image</label>
                        <input type="file" name="todoImage" id="todoImage" accept="image/*"
                            class="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100">
                        <div id="imagePreview" class="mt-2 hidden">
                            <img id="previewImage" class="max-w-xs rounded-lg shadow-sm">
                        </div>
                    </div>
                    <button type="submit"
                        class="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Add Todo
                    </button>
                </form>
            </div>

            <!-- Todo List -->
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-semibold mb-4">Todo List</h2>
                <div id="todoList" class="space-y-4"></div>
            </div>

            <!-- Edit Modal -->
            <div id="editModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden">
                <div class="fixed inset-0 flex items-center justify-center">
                    <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                        <h2 class="text-xl font-semibold mb-4">Edit Todo</h2>
                        <form id="editTodoForm" class="space-y-4">
                            <input type="hidden" id="editId">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" id="editTitle" required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Summary</label>
                                <textarea id="editSummary" required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                            </div>
                            <div class="flex space-x-4">
                                <button type="submit"
                                    class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Save
                                </button>
                                <button type="button" onclick="closeEditModal()"
                                    class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Utility functions
            const api = {
                async getTodos() {
                    const response = await fetch('/todos');
                    return response.json();
                },
                async addTodo(todo) {
                    const response = await fetch('/todos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(todo)
                    });
                    return response.json();
                },
                async updateTodo(id, todo) {
                    const response = await fetch(\`/todos/\${id}\`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(todo)
                    });
                    return response.json();
                },
                async deleteTodo(id) {
                    const response = await fetch(\`/todos/\${id}\`, {
                        method: 'DELETE'
                    });
                    return response.json();
                },
                async uploadImage(file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                        const response = await fetch('/upload-image', {
                            method: 'POST',
                            body: formData
                        })
                        
                        if (!response.ok) {
                            throw new Error('Upload failed')
                        }
                        
                        return response.json()
                    } catch (error) {
                        console.error('Upload error:', error)
                        throw error
                    }
                }
            };

            // DOM Elements
            const todoList = document.getElementById('todoList');
            const addTodoForm = document.getElementById('addTodoForm');
            const editModal = document.getElementById('editModal');
            const editTodoForm = document.getElementById('editTodoForm');

            // Load todos
            async function loadTodos() {
                const todos = await api.getTodos();
                todoList.innerHTML = todos.map(todo => {
                    let html = '<div class="border rounded-lg p-4 flex justify-between items-start" data-id="' + todo.id + '">';
                    html += '  <div>';
                    html += '    <h3 class="text-lg font-semibold">' + todo.title + '</h3>';
                    html += '    <p class="text-sm text-gray-500">' + todo.summary + '</p>';
                    html += '  </div>';
                    html += '  <div>';
                    html += '    <button class="text-blue-500 hover:text-blue-700" onclick="openEditModal(\\'' + todo.id + '\\', \\'' + todo.title + '\\', \\'' + todo.summary + '\\')">Edit</button>';
                    html += '    <button class="text-red-500 hover:text-red-700" onclick="deleteTodo(\\'' + todo.id + '\\')">Delete</button>';
                    html += '  </div>';
                    if (todo.imageId) {
                        html += '  <div class="mt-4">';
                        //html += '    <img src="https://api.cloudflare.com/client/v4/accounts/' + accountId + '/images/v1/' + todo.imageId + '" class="max-w-xs rounded-lg shadow-sm">';
                        html += '    <img src="https://imagedelivery.net/` + c.env.CF_IMAGES_ACCOUNT_HASH + `/' + todo.imageId + '/public" alt="Todo image" class="max-w-xs rounded-lg shadow-sm">';
                        html += '  </div>';
                    }
                    html += '</div>';
                    return html;
                }).join('');
            }
            
            // Image preview functionality
            document.getElementById('todoImage').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const preview = document.getElementById('imagePreview');
                        const previewImage = document.getElementById('previewImage');
                        previewImage.src = e.target.result;
                        preview.classList.remove('hidden');
                    }
                    reader.readAsDataURL(file);
                }
            });

            // Add todo
            addTodoForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const title = document.getElementById('newTitle').value;
                const summary = document.getElementById('newSummary').value;
                const files = document.getElementById('todoImage').files || [];
                const imageFile = files.length > 0 ?
                    document.getElementById('todoImage').files[0]: null;
                
                try {
                    let imageId = null;
                    
                    // Upload image if one is selected
                    if (imageFile) {
                        const imageResponse = await api.uploadImage(imageFile);
                        if (imageResponse.result && imageResponse.result.id) {
                            imageId = imageResponse.result.id
                        } else {
                            throw new Error('Image upload failed')
                        }
                    }
                    
                    // Create todo with image ID if available
                    await api.addTodo({ 
                        title, 
                        summary,
                        imageId 
                    });
                    
                    // Reset form and preview
                    addTodoForm.reset();
                    document.getElementById('imagePreview').classList.add('hidden');
                    await loadTodos();
                    
                } catch (error) {
                    console.error('Error creating todo:', error);
                    alert('Failed to create todo. Please try again.');
                }
            });

            // Edit todo
            function openEditModal(id, title, summary) {
                document.getElementById('editId').value = id;
                document.getElementById('editTitle').value = title;
                document.getElementById('editSummary').value = summary;
                editModal.classList.remove('hidden');
            }

            function closeEditModal() {
                editModal.classList.add('hidden');
                editTodoForm.reset();
            }

            editTodoForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('editId').value;
                const title = document.getElementById('editTitle').value;
                const summary = document.getElementById('editSummary').value;
                
                await api.updateTodo(id, { title, summary });
                closeEditModal();
                await loadTodos();
            });

            // Delete todo
            async function deleteTodo(id) {
                if (confirm('Are you sure you want to delete this todo?')) {
                    await api.deleteTodo(id);
                    await loadTodos();
                }
            }

            // Initial load
            loadTodos();
        </script>
    </body>
    </html>
  `
    return c.html(htmlContent);
}