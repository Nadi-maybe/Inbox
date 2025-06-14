/**
 * perfil.js - Funcionalidades específicas da página de perfil do usuário
 * Gerencia edição de informações do perfil e interações relacionadas
 */

/**
 * Inicializa todas as funcionalidades quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    initPerfilActions();
    // Adicionar listener para verificar o parâmetro de sucesso na URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        showToast('Perfil atualizado com sucesso!', 'success');
    }
});

/**
 * Inicializa as ações principais da página de perfil
 * Configura todos os elementos interativos relacionados ao perfil
 */
function initPerfilActions() {
    // Não é necessário adicionar o botão de edição via JS, ele agora é um link direto no EJS
}

/**
 * Exibe uma notificação toast temporária
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de mensagem (info, success, error)
 */
function showToast(message, type = 'info') {
    // Verificar se o container de toast existe
    let toastContainer = document.querySelector('.toast-container');
    
    // Se não existir, criar
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.left = '50%';
        toastContainer.style.transform = 'translateX(-50%)';
        toastContainer.style.zIndex = '1000';
        document.body.appendChild(toastContainer);
    }
    
    // Criar toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Estilizar toast
    toast.style.backgroundColor = type === 'success' ? '#28a745' : '#0047CC';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '4px';
    toast.style.marginBottom = '10px';
    toast.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    
    // Adicionar ao container
    toastContainer.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Remover toast após 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
} 