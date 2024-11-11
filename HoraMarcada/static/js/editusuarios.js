// Alterar imagem de perfil
document.getElementById('upload-img').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-img').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Exibir o modal de confirmação ao salvar alterações somente se todos os campos estiverem preenchidos
document.getElementById('save-changes-btn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    // Verifica se todos os campos estão preenchidos
    if (username === '' || email === '' || password === '') {
        errorMessage.classList.add('show');  // Exibe a mensagem de erro
    } else if (!validateEmail(email)) { // Verifica se o e-mail é válido
        errorMessage.classList.add('show'); // Exibe a mensagem de erro
        errorMessage.innerText = "Por favor, insira um e-mail válido.";
    } else {
        errorMessage.classList.remove('show');  // Oculta a mensagem de erro, se houver
        // Exibe o modal de confirmação se os campos estiverem preenchidos
        const saveModal = document.getElementById('confirm-save-modal');
        saveModal.classList.remove('hidden');
        saveModal.classList.add('show'); // Adiciona a animação de surgimento
    }
});

// Função para validar o formato do e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expressão regular para validar e-mail
    return re.test(String(email).toLowerCase());
}


// Confirmar o salvamento no modal (só se o modal foi exibido após validação)
document.getElementById('confirm-save-btn').addEventListener('click', function() {
    // Envia o formulário
    document.getElementById('editForm').submit();  // Envia o formulário após confirmação
    alert("Alterações salvas com sucesso!");
    document.getElementById('confirm-save-modal').classList.add('hidden');
    document.getElementById('confirm-save-modal').classList.remove('show');
});

// Cancelar o salvamento no modal
document.getElementById('cancel-save-btn').addEventListener('click', function() {
    document.getElementById('confirm-save-modal').classList.add('hidden');
});

// Exibir o modal de confirmação de exclusão de conta
document.getElementById('delete-account-btn').addEventListener('click', function() {
    const deleteModal = document.getElementById('confirm-delete-modal');
    deleteModal.classList.remove('hidden');
    deleteModal.classList.add('show'); // Adiciona a animação de surgimento
});

// Confirmar a exclusão no modal
document.getElementById('confirm-delete-btn').addEventListener('click', function() {
    alert("Conta excluída com sucesso!");
    document.getElementById('confirm-delete-modal').classList.add('hidden');
    // Aqui você pode adicionar a lógica para excluir a conta no banco de dados
});

// Cancelar a exclusão no modal
document.getElementById('cancel-delete-btn').addEventListener('click', function() {
    // Oculta o modal de confirmação de exclusão
    document.getElementById('confirm-delete-modal').classList.add('hidden');
});
