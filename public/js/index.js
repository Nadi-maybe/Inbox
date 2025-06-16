

document.addEventListener('DOMContentLoaded', function() {
    initIndexActions();
});


function initIndexActions() {
    
    initGroupItems();
    
    
    initRegistroItems();
    
    
    initAddGroupButton();
}


function initAddGroupButton() {
    const btn = document.querySelector('.card-title .btn');
    if (!btn) return;
    
    
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    btn.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    btn.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1.1)';
    });
}


function initGroupItems() {
    const groupItems = document.querySelectorAll('.group-item');
    
    groupItems.forEach(item => {
        
        item.addEventListener('click', function() {
            const groupId = this.getAttribute('data-id');
            const groupName = this.querySelector('.group-name').textContent;
            const groupPhoto = this.querySelector('.group-photo img').src;
            
            showGroupDetails(groupId, groupName, groupPhoto);
        });
    });
}


function initRegistroItems() {
    const registroItems = document.querySelectorAll('.registro-item');
    
    registroItems.forEach(item => {
        
        item.addEventListener('click', function() {
            const registroId = this.getAttribute('data-id');
            const registroNome = this.querySelector('h4').textContent;
            const registroData = this.querySelector('.registro-time').textContent;
            
            showRegistroDetails(registroId, registroNome, registroData);
        });
    });
}


function showGroupDetails(id, name, photo) {
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <span class="close-modal">&times;</span>
                <h2>Detalhes do Grupo</h2>
            </div>
            <div class="modal-body">
                <div class="group-details">
                    <div class="group-detail-photo">
                        <img src="${photo}" alt="${name}">
                    </div>
                    <h3>${name}</h3>
                    <p class="group-id">ID: ${id}</p>
                    
                    <div class="group-actions">
                        <button class="action-btn view-items-btn">
                            <i class="fas fa-box"></i> Ver Itens
                        </button>
                        <button class="action-btn add-member-btn">
                            <i class="fas fa-user-plus"></i> Adicionar Membro
                        </button>
                        <button class="action-btn edit-group-btn">
                            <i class="fas fa-edit"></i> Editar Grupo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.zIndex = '100';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    modal.style.animation = 'fadeIn 0.3s';
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '0';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    modalContent.style.animation = 'slideIn 0.3s';
    
    const modalHeader = modal.querySelector('.modal-header');
    modalHeader.style.padding = '15px';
    modalHeader.style.borderBottom = '1px solid #ddd';
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    
    const closeModal = modal.querySelector('.close-modal');
    closeModal.style.color = '#aaa';
    closeModal.style.fontSize = '28px';
    closeModal.style.fontWeight = 'bold';
    closeModal.style.cursor = 'pointer';
    
    const modalBody = modal.querySelector('.modal-body');
    modalBody.style.padding = '20px';
    
    const groupDetails = modal.querySelector('.group-details');
    groupDetails.style.display = 'flex';
    groupDetails.style.flexDirection = 'column';
    groupDetails.style.alignItems = 'center';
    
    const groupDetailPhoto = modal.querySelector('.group-detail-photo');
    groupDetailPhoto.style.width = '100px';
    groupDetailPhoto.style.height = '100px';
    groupDetailPhoto.style.borderRadius = '50%';
    groupDetailPhoto.style.overflow = 'hidden';
    groupDetailPhoto.style.margin = '0 auto 15px';
    groupDetailPhoto.style.border = '3px solid #0047CC';
    
    const groupDetailImg = groupDetailPhoto.querySelector('img');
    groupDetailImg.style.width = '100%';
    groupDetailImg.style.height = '100%';
    groupDetailImg.style.objectFit = 'cover';
    
    const groupId = modal.querySelector('.group-id');
    groupId.style.color = '#777';
    groupId.style.fontSize = '14px';
    groupId.style.marginBottom = '20px';
    
    const groupActions = modal.querySelector('.group-actions');
    groupActions.style.display = 'flex';
    groupActions.style.flexDirection = 'column';
    groupActions.style.width = '100%';
    groupActions.style.gap = '10px';
    
    const actionBtns = modal.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.style.padding = '10px';
        btn.style.backgroundColor = '#f3f3f3';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.gap = '8px';
        btn.style.transition = 'background-color 0.2s';
        
        btn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e3e3e3';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#f3f3f3';
        });
    });
    
    
    closeModal.addEventListener('click', function() {
        modal.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 280);
    });
    
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 280);
        }
    });
    
    
    const viewItemsBtn = modal.querySelector('.view-items-btn');
    viewItemsBtn.addEventListener('click', function() {
        
        showToast('Visualização de itens em desenvolvimento', 'info');
    });
    
    const addMemberBtn = modal.querySelector('.add-member-btn');
    addMemberBtn.addEventListener('click', function() {
        
        showToast('Adicionar membro em desenvolvimento', 'info');
    });
    
    const editGroupBtn = modal.querySelector('.edit-group-btn');
    editGroupBtn.addEventListener('click', function() {
        
        showToast('Edição de grupo em desenvolvimento', 'info');
    });
    
    
    document.body.appendChild(modal);
    
    
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn {
            from {opacity: 0;}
            to {opacity: 1;}
        }
        @keyframes fadeOut {
            from {opacity: 1;}
            to {opacity: 0;}
        }
        @keyframes slideIn {
            from {transform: translateY(-30px);}
            to {transform: translateY(0);}
        }
    `;
    document.head.appendChild(style);
}


function showRegistroDetails(id, nome, data) {
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <span class="close-modal">&times;</span>
                <h2>Detalhes do Registro</h2>
            </div>
            <div class="modal-body">
                <div class="registro-details">
                    <div class="registro-icon">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <h3>${nome}</h3>
                    <p>Emprestado até: <strong>${data}</strong></p>
                    <p class="registro-id">ID: ${id}</p>
                    
                    <div class="registro-actions">
                        <button class="action-btn extend-btn">
                            <i class="fas fa-clock"></i> Estender Prazo
                        </button>
                        <button class="action-btn return-btn">
                            <i class="fas fa-undo"></i> Devolver Item
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.zIndex = '100';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    modal.style.animation = 'fadeIn 0.3s';
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '0';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    modalContent.style.animation = 'slideIn 0.3s';
    
    const modalHeader = modal.querySelector('.modal-header');
    modalHeader.style.padding = '15px';
    modalHeader.style.borderBottom = '1px solid #ddd';
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    
    const closeModal = modal.querySelector('.close-modal');
    closeModal.style.color = '#aaa';
    closeModal.style.fontSize = '28px';
    closeModal.style.fontWeight = 'bold';
    closeModal.style.cursor = 'pointer';
    
    const modalBody = modal.querySelector('.modal-body');
    modalBody.style.padding = '20px';
    
    const registroDetails = modal.querySelector('.registro-details');
    registroDetails.style.display = 'flex';
    registroDetails.style.flexDirection = 'column';
    registroDetails.style.alignItems = 'center';
    
    const registroIcon = modal.querySelector('.registro-icon');
    registroIcon.style.width = '70px';
    registroIcon.style.height = '70px';
    registroIcon.style.borderRadius = '50%';
    registroIcon.style.backgroundColor = '#0047CC';
    registroIcon.style.color = 'white';
    registroIcon.style.display = 'flex';
    registroIcon.style.alignItems = 'center';
    registroIcon.style.justifyContent = 'center';
    registroIcon.style.fontSize = '30px';
    registroIcon.style.margin = '0 auto 15px';
    
    const registroId = modal.querySelector('.registro-id');
    registroId.style.color = '#777';
    registroId.style.fontSize = '14px';
    registroId.style.marginBottom = '20px';
    
    const registroActions = modal.querySelector('.registro-actions');
    registroActions.style.display = 'flex';
    registroActions.style.flexDirection = 'column';
    registroActions.style.width = '100%';
    registroActions.style.gap = '10px';
    
    const actionBtns = modal.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.style.padding = '10px';
        btn.style.backgroundColor = '#f3f3f3';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.gap = '8px';
        btn.style.transition = 'background-color 0.2s';
        
        btn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e3e3e3';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#f3f3f3';
        });
    });
    
    
    closeModal.addEventListener('click', function() {
        modal.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 280);
    });
    
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 280);
        }
    });
    
    
    const extendBtn = modal.querySelector('.extend-btn');
    extendBtn.addEventListener('click', function() {
        
        showToast('Extensão de prazo em desenvolvimento', 'info');
    });
    
    const returnBtn = modal.querySelector('.return-btn');
    returnBtn.addEventListener('click', function() {
        
        showConfirmDialog(
            'Confirmar Devolução', 
            `Deseja confirmar a devolução do item "${nome}"?`,
            function() {
                
                
                const registroItem = document.querySelector(`.registro-item[data-id="${id}"]`);
                if (registroItem) {
                    registroItem.style.animation = 'slideOutRight 0.3s';
                    setTimeout(() => {
                        registroItem.remove();
                        
                        
                        const registrosCard = document.querySelectorAll('.card')[1];
                        const registroItems = registrosCard.querySelectorAll('.registro-item');
                        
                        if (registroItems.length === 0) {
                            
                            const emptyState = document.createElement('div');
                            emptyState.className = 'empty-state';
                            emptyState.innerHTML = `
                                <div class="empty-icon">
                                    <i class="fas fa-clipboard-list"></i>
                                </div>
                                <p>Nenhum registro feito</p>
                            `;
                            registrosCard.appendChild(emptyState);
                        }
                    }, 280);
                }
                
                showToast('Item devolvido com sucesso', 'success');
                modal.style.animation = 'fadeOut 0.3s';
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 280);
            }
        );
    });
    
    
    document.body.appendChild(modal);
    
    
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn {
            from {opacity: 0;}
            to {opacity: 1;}
        }
        @keyframes fadeOut {
            from {opacity: 1;}
            to {opacity: 0;}
        }
        @keyframes slideIn {
            from {transform: translateY(-30px);}
            to {transform: translateY(0);}
        }
        @keyframes slideOutRight {
            from {transform: translateX(0);}
            to {transform: translateX(100%);}
        }
    `;
    document.head.appendChild(style);
}


function showToast(message, type = 'info') {
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        </div>
        <div class="toast-message">${message}</div>
    `;
    
    
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3';
    toast.style.color = 'white';
    toast.style.padding = '10px 15px';
    toast.style.borderRadius = '4px';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.zIndex = '1000';
    toast.style.minWidth = '250px';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    
    const toastIcon = toast.querySelector('.toast-icon');
    toastIcon.style.marginRight = '10px';
    toastIcon.style.fontSize = '20px';
    
    
    document.body.appendChild(toast);
    
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}


function showConfirmDialog(title, message, confirmCallback) {
    
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
        <div class="confirm-content">
            <div class="confirm-header">
                <h3>${title}</h3>
            </div>
            <div class="confirm-body">
                <p>${message}</p>
            </div>
            <div class="confirm-footer">
                <button class="cancel-btn">Cancelar</button>
                <button class="confirm-btn">Confirmar</button>
            </div>
        </div>
    `;
    
    
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.zIndex = '110';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    modal.style.animation = 'fadeIn 0.3s';
    
    const confirmContent = modal.querySelector('.confirm-content');
    confirmContent.style.backgroundColor = '#fefefe';
    confirmContent.style.margin = '20% auto';
    confirmContent.style.padding = '0';
    confirmContent.style.border = '1px solid #888';
    confirmContent.style.width = '80%';
    confirmContent.style.maxWidth = '400px';
    confirmContent.style.borderRadius = '8px';
    confirmContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    confirmContent.style.animation = 'slideIn 0.3s';
    
    const confirmHeader = modal.querySelector('.confirm-header');
    confirmHeader.style.padding = '15px';
    confirmHeader.style.borderBottom = '1px solid #ddd';
    
    const confirmBody = modal.querySelector('.confirm-body');
    confirmBody.style.padding = '20px';
    
    const confirmFooter = modal.querySelector('.confirm-footer');
    confirmFooter.style.padding = '15px';
    confirmFooter.style.borderTop = '1px solid #ddd';
    confirmFooter.style.display = 'flex';
    confirmFooter.style.justifyContent = 'flex-end';
    confirmFooter.style.gap = '10px';
    
    const cancelBtn = modal.querySelector('.cancel-btn');
    cancelBtn.style.padding = '8px 15px';
    cancelBtn.style.backgroundColor = '#f3f3f3';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.cursor = 'pointer';
    
    const confirmBtn = modal.querySelector('.confirm-btn');
    confirmBtn.style.padding = '8px 15px';
    confirmBtn.style.backgroundColor = '#0047CC';
    confirmBtn.style.color = 'white';
    confirmBtn.style.border = 'none';
    confirmBtn.style.borderRadius = '4px';
    confirmBtn.style.cursor = 'pointer';
    
    
    cancelBtn.addEventListener('click', function() {
        modal.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 280);
    });
    
    confirmBtn.addEventListener('click', function() {
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
        
        modal.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 280);
    });
    
    
    document.body.appendChild(modal);
    
    
    if (!document.querySelector('style[data-animations="confirm"]')) {
        const style = document.createElement('style');
        style.setAttribute('data-animations', 'confirm');
        style.innerHTML = `
            @keyframes fadeIn {
                from {opacity: 0;}
                to {opacity: 1;}
            }
            @keyframes fadeOut {
                from {opacity: 1;}
                to {opacity: 0;}
            }
            @keyframes slideIn {
                from {transform: translateY(-30px);}
                to {transform: translateY(0);}
            }
        `;
        document.head.appendChild(style);
    }
} 