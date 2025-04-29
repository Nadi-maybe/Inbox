/**
 * perfil.js - Funcionalidades específicas da página de perfil do usuário
 * Gerencia edição de informações do perfil e interações relacionadas
 */

/**
 * Inicializa todas as funcionalidades quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    initPerfilActions();
});

/**
 * Inicializa as ações principais da página de perfil
 * Configura todos os elementos interativos relacionados ao perfil
 */
function initPerfilActions() {
    // Adicionar botão para editar dados do perfil
    addEditButton();
}

/**
 * Adiciona botão de edição ao cabeçalho do perfil
 * Este botão permite ao usuário abrir o modal de edição de perfil
 */
function addEditButton() {
    const profileHeader = document.querySelector('.profile-header');
    if (!profileHeader) return;
    
    // Criar botão de edição
    const editButton = document.createElement('button');
    editButton.className = 'edit-profile-btn';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    
    // Adicionar botão ao cabeçalho do perfil
    profileHeader.appendChild(editButton);
    
    // Adicionar evento de clique para abrir modal de edição
    editButton.addEventListener('click', showEditProfileModal);
}

/**
 * Exibe o modal para edição do perfil
 * Cria dinamicamente um modal com formulário para editar informações
 */
function showEditProfileModal() {
    // Obter dados atuais do perfil
    const profileName = document.querySelector('.profile-name').textContent.trim().split(' ')[0];
    const profileId = document.querySelector('.profile-id').textContent;
    const profileDetails = document.querySelectorAll('.profile-details');
    
    // Obter valores atuais de todos os campos
    const currentApelido = profileDetails[0].textContent;
    const currentEmail = profileDetails[1].textContent;
    const currentTelefone = profileDetails[2].textContent;
    
    // Criar estrutura do modal
    const modal = createEditProfileModal(profileName, currentApelido, currentEmail, currentTelefone);
    
    // Adicionar à página
    document.body.appendChild(modal);
    
    // Configurar botões de ação
    const modalClose = modal.querySelector('.modal-close');
    const cancelButton = modal.querySelector('.btn-cancel');
    const confirmButton = modal.querySelector('.btn-confirm');
    
    modalClose.addEventListener('click', () => closeModal(modal));
    cancelButton.addEventListener('click', () => closeModal(modal));
    
    // Configurar botão de salvar
    confirmButton.addEventListener('click', function() {
        const form = document.getElementById('edit-profile-form');
        if (validateProfileForm(form)) {
            saveProfileChanges(form, modal);
        }
    });
}

/**
 * Cria a estrutura HTML e CSS do modal de edição de perfil
 * @param {string} name - Nome atual do usuário
 * @param {string} apelido - Apelido atual do usuário
 * @param {string} email - Email atual do usuário
 * @param {string} telefone - Telefone atual do usuário
 * @returns {HTMLElement} - Elemento modal completo com estilos
 */
function createEditProfileModal(name, apelido, email, telefone) {
    // Criar elemento modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Definir conteúdo HTML do modal
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Editar Perfil</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edit-profile-form">
                    <div class="form-group">
                        <label for="edit-name">Nome</label>
                        <input type="text" id="edit-name" value="${name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-apelido">Apelido</label>
                        <input type="text" id="edit-apelido" value="${apelido === 'Sem apelido' ? '' : apelido}">
                    </div>
                    <div class="form-group">
                        <label for="edit-email">Email</label>
                        <input type="email" id="edit-email" value="${email === 'Sem email' ? '' : email}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-telefone">Telefone</label>
                        <input type="tel" id="edit-telefone" value="${telefone === 'Sem telefone' ? '' : telefone}">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel">Cancelar</button>
                <button class="btn-confirm" id="save-profile">Salvar</button>
            </div>
        </div>
    `;
    
    // Aplicar estilos ao modal
    applyModalStyles(modal);
    
    return modal;
}

/**
 * Aplica estilos CSS ao modal e seus elementos internos
 * @param {HTMLElement} modal - Elemento modal a ser estilizado
 */
function applyModalStyles(modal) {
    // Estilos para o container do modal
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // Estilos para o conteúdo do modal
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '400px';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflow = 'auto';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    
    // Estilos para o cabeçalho do modal
    const modalHeader = modal.querySelector('.modal-header');
    modalHeader.style.padding = '15px';
    modalHeader.style.borderBottom = '1px solid #eee';
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    
    // Estilos para o botão de fechar
    const modalClose = modal.querySelector('.modal-close');
    modalClose.style.background = 'none';
    modalClose.style.border = 'none';
    modalClose.style.fontSize = '24px';
    modalClose.style.cursor = 'pointer';
    
    // Estilos para o corpo do modal
    const modalBody = modal.querySelector('.modal-body');
    modalBody.style.padding = '15px';
    
    // Estilos para os grupos de formulário
    const formGroups = modal.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.style.marginBottom = '15px';
    });
    
    // Estilos para as labels
    const labels = modal.querySelectorAll('label');
    labels.forEach(label => {
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.fontWeight = 'bold';
    });
    
    // Estilos para os inputs
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.borderRadius = '4px';
        input.style.border = '1px solid #ddd';
        input.style.boxSizing = 'border-box';
    });
    
    // Estilos para o rodapé do modal
    const modalFooter = modal.querySelector('.modal-footer');
    modalFooter.style.padding = '15px';
    modalFooter.style.borderTop = '1px solid #eee';
    modalFooter.style.display = 'flex';
    modalFooter.style.justifyContent = 'flex-end';
    modalFooter.style.gap = '10px';
    
    // Estilos para os botões
    const buttons = modal.querySelectorAll('button.btn-cancel, button.btn-confirm');
    buttons.forEach(button => {
        button.style.padding = '8px 15px';
        button.style.borderRadius = '4px';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
    });
    
    // Estilos específicos para cada botão
    const cancelButton = modal.querySelector('.btn-cancel');
    cancelButton.style.backgroundColor = '#f5f5f5';
    
    const confirmButton = modal.querySelector('.btn-confirm');
    confirmButton.style.backgroundColor = '#0047CC';
    confirmButton.style.color = 'white';
}

/**
 * Fecha e remove o modal da página com animação
 * @param {HTMLElement} modal - O modal a ser fechado
 */
function closeModal(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

/**
 * Valida o formulário de edição de perfil
 * @param {HTMLFormElement} form - O formulário a ser validado
 * @returns {boolean} - True se o formulário for válido, False caso contrário
 */
function validateProfileForm(form) {
    let isValid = true;
    
    // Validar nome
    const nameField = form.querySelector('#edit-name');
    if (!nameField.value.trim()) {
        showFieldError(nameField, 'Nome é obrigatório');
        isValid = false;
    }
    
    // Validar email
    const emailField = form.querySelector('#edit-email');
    if (!emailField.value.trim()) {
        showFieldError(emailField, 'Email é obrigatório');
        isValid = false;
    } else if (!isValidEmail(emailField.value)) {
        showFieldError(emailField, 'Email inválido');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Exibe erro visual em um campo específico do formulário
 * @param {HTMLElement} field - O campo com erro
 * @param {string} message - A mensagem de erro a ser exibida
 */
function showFieldError(field, message) {
    // Remover erro existente
    clearFieldError(field);
    
    // Adicionar classe de erro
    field.style.borderColor = '#e74c3c';
    
    // Criar elemento de mensagem de erro
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '5px';
    
    // Inserir após o campo
    field.parentNode.appendChild(errorElement);
}

/**
 * Remove indicadores de erro de um campo
 * @param {HTMLElement} field - O campo a ser limpo
 */
function clearFieldError(field) {
    field.style.borderColor = '#ddd';
    
    // Remover mensagem de erro
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.parentNode.removeChild(errorElement);
    }
}

/**
 * Verifica se um email é válido usando expressão regular
 * @param {string} email - O email a ser validado
 * @returns {boolean} - True se o email for válido
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Salva as alterações do perfil e atualiza a interface
 * @param {HTMLFormElement} form - O formulário com os dados
 * @param {HTMLElement} modal - O modal a ser fechado após salvar
 */
function saveProfileChanges(form, modal) {
    // Simular estado de carregamento
    const saveButton = document.getElementById('save-profile');
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    saveButton.disabled = true;
    
    // Obter valores do formulário
    const name = form.querySelector('#edit-name').value;
    const apelido = form.querySelector('#edit-apelido').value;
    const email = form.querySelector('#edit-email').value;
    const telefone = form.querySelector('#edit-telefone').value;
    
    // Simular atraso de processo 
    // NOTA: Em produção, substituir por chamada AJAX para o backend
    setTimeout(() => {
        // Atualizar elementos na página
        const profileName = document.querySelector('.profile-name');
        const profileDetails = document.querySelectorAll('.profile-details');
        
        // Atualizar nome mantendo ID
        const idPart = profileName.querySelector('.profile-id').outerHTML;
        profileName.innerHTML = name + ' ' + idPart;
        
        // Atualizar outros campos
        profileDetails[0].textContent = apelido || 'Sem apelido';
        profileDetails[1].textContent = email || 'Sem email';
        profileDetails[2].textContent = telefone || 'Sem telefone';
        
        // Fechar modal
        closeModal(modal);
        
        // Mostrar mensagem de sucesso
        showToast('Perfil atualizado com sucesso!', 'success');
    }, 1000);
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