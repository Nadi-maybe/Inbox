/**
 * main.js - Arquivo JavaScript principal do Inbox 24/7
 * Contém funções compartilhadas por todas as páginas da aplicação
 */

/**
 * Executado quando o DOM está completamente carregado
 * Inicializa todos os componentes globais da aplicação
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inbox 24/7 - Aplicação inicializada');
    
    // Inicializar componentes globais
    initToasts();
    setupForms();
    
    // Verificar notificações não lidas e animar ícone
    checkUnreadNotifications();
    
    // Remover classe de loading se existir
    document.body.classList.remove('loading');
});

/**
 * Sistema de Toast para Notificações
 * Mostra notificações temporárias no canto da tela
 */

/**
 * Inicializa o container para toasts
 * Cria o elemento container se não existir
 */
function initToasts() {
    // Criar container de toasts se não existir
    if (!document.querySelector('.toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

/**
 * Mostra uma mensagem toast para feedback ao usuário
 * @param {string} message - Texto da mensagem
 * @param {string} type - Tipo da mensagem: 'info', 'success', 'error', etc.
 * @param {number} duration - Duração em milissegundos que o toast ficará visível
 */
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.querySelector('.toast-container');
    
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    
    // Adicionar toast ao container
    toastContainer.appendChild(toast);
    
    // Animar entrada com pequeno delay para permitir transição
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remover toast após a duração especificada
    setTimeout(() => {
        // Animar saída
        toast.classList.remove('show');
        
        // Remover do DOM após animação de saída
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * Verificar se há notificações não lidas e animar o sino no menu
 * Esta função é chamada em todas as páginas para manter consistência
 */
function checkUnreadNotifications() {
    fetch('/api/notificacoes/nao-lidas')
    .then(response => response.json())
    .then(data => {
        const hasUnread = data.has_unread;
        
        // Selecionar o ícone do sino no menu
        const bellIcon = document.querySelector('.bottom-nav a[href="/notificacoes"] i');
        
        if (bellIcon) {
            if (hasUnread) {
                // Adicionar classe de animação ao sino
                if (!bellIcon.classList.contains('shake')) {
                    bellIcon.classList.add('shake');
                    
                    // Adicionar estilos de animação se ainda não existirem
                    if (!document.getElementById('bell-animation-style')) {
                        const style = document.createElement('style');
                        style.id = 'bell-animation-style';
                        style.innerHTML = `
                            @keyframes shake {
                                0% { transform: rotate(0); }
                                10% { transform: rotate(10deg); }
                                20% { transform: rotate(-10deg); }
                                30% { transform: rotate(6deg); }
                                40% { transform: rotate(-6deg); }
                                50% { transform: rotate(0); }
                                100% { transform: rotate(0); }
                            }
                            
                            .shake {
                                animation: shake 2s ease-in-out infinite;
                                transform-origin: 50% 0;
                                display: inline-block;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
                
                // Adicionar indicador de notificação não lida
                if (!document.querySelector('.notification-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'notification-indicator';
                    indicator.style.position = 'absolute';
                    indicator.style.top = '8px';
                    indicator.style.right = '8px';
                    indicator.style.width = '8px';
                    indicator.style.height = '8px';
                    indicator.style.backgroundColor = '#F44336';
                    indicator.style.borderRadius = '50%';
                    
                    const navItem = document.querySelector('.bottom-nav a[href="/notificacoes"]');
                    navItem.style.position = 'relative';
                    navItem.appendChild(indicator);
                }
            } else {
                // Remover classe de animação
                bellIcon.classList.remove('shake');
                
                // Remover indicador de notificação
                const indicator = document.querySelector('.notification-indicator');
                if (indicator) {
                    indicator.remove();
                }
            }
        }
    })
    .catch(error => {
        console.error('Erro ao verificar notificações não lidas:', error);
    });
}

/**
 * Sistema de Validação de Formulários
 * Fornece validação em tempo real para todos os formulários do sistema
 */

/**
 * Configura validação para todos os formulários na página
 * Adiciona validação em tempo real e no envio
 */
function setupForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Adicionar validação ao enviar formulário
        setupFormSubmitValidation(form);
        
        // Adicionar validação em tempo real nos campos
        setupRealtimeValidation(form);
    });
}

/**
 * Configura validação no momento do envio do formulário
 * @param {HTMLFormElement} form - O formulário a ser validado
 */
function setupFormSubmitValidation(form) {
    form.addEventListener('submit', function(event) {
        let isValid = true;
        
        // Verificar campos obrigatórios
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                showFieldError(field, 'Este campo é obrigatório');
            } else {
                clearFieldError(field);
            }
        });
        
        // Verificar emails
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !isValidEmail(field.value)) {
                isValid = false;
                showFieldError(field, 'Email inválido');
            }
        });
        
        // Verificar confirmação de senha
        const senhaField = form.querySelector('#senha');
        const confirmarSenhaField = form.querySelector('#confirmar_senha');
        
        if (senhaField && confirmarSenhaField) {
            if (senhaField.value !== confirmarSenhaField.value) {
                isValid = false;
                showFieldError(confirmarSenhaField, 'As senhas não coincidem');
            }
        }
        
        // Prevenir envio se inválido
        if (!isValid) {
            event.preventDefault();
            showToast('Por favor, verifique os campos destacados', 'error');
        } else {
            // Adicionar estado de loading no botão
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
                submitButton.disabled = true;
            }
        }
    });
}

/**
 * Configura validação em tempo real para os campos do formulário
 * @param {HTMLFormElement} form - O formulário a configurar
 */
function setupRealtimeValidation(form) {
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Validar campo obrigatório
            if (input.hasAttribute('required') && input.value.trim()) {
                clearFieldError(input);
            }
            
            // Validar email
            if (input.type === 'email' && input.value.trim() && isValidEmail(input.value)) {
                clearFieldError(input);
            }
            
            // Checar confirmação de senha
            if (input.id === 'senha' || input.id === 'confirmar_senha') {
                const senha = form.querySelector('#senha');
                const confirmarSenha = form.querySelector('#confirmar_senha');
                
                if (senha && confirmarSenha && confirmarSenha.value) {
                    if (senha.value === confirmarSenha.value) {
                        clearFieldError(confirmarSenha);
                    }
                }
            }
        });
    });
}

/**
 * Funções auxiliares para validação
 */

/**
 * Verifica se um email é válido
 * @param {string} email - O email a ser validado
 * @returns {boolean} - Verdadeiro se o email for válido
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Mostra mensagem de erro para campo inválido
 * @param {HTMLElement} field - O campo com erro
 * @param {string} message - Mensagem de erro a exibir
 */
function showFieldError(field, message) {
    // Limpar erro existente
    clearFieldError(field);
    
    // Aplicar estilo de erro
    field.classList.add('input-error');
    
    // Criar mensagem de erro
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerText = message;
    
    // Inserir mensagem após o campo
    field.parentNode.appendChild(errorMessage);
}

/**
 * Remove mensagem de erro de um campo
 * @param {HTMLElement} field - O campo a limpar o erro
 */
function clearFieldError(field) {
    field.classList.remove('input-error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
} 