// notificacoes.js - Funcionalidades específicas da página de notificações

document.addEventListener('DOMContentLoaded', function() {
    initNotificacoesPage();
    checkUnreadNotifications();
});

// Inicializar a página de notificações
function initNotificacoesPage() {
    // Inicializar ações dos botões nas notificações
    initNotificationButtons();
    
    // Inicializar botão para limpar todas as notificações
    initClearAllButton();
    
    // Inicializar botão para adicionar convite de demonstração
    initAddDemoInviteButton();
}

// Inicializar os botões nas notificações
function initNotificationButtons() {
    // Botões de marcar como lida
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', function(event) {
            event.preventDefault();
            const notificationCard = this.closest('.notification-card');
            const notificationId = notificationCard.getAttribute('data-id');
            markNotificationAsRead(notificationId, notificationCard);
        });
    });
    
    // Botões de remover notificação
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function(event) {
            event.preventDefault();
            const notificationCard = this.closest('.notification-card');
            const notificationId = notificationCard.getAttribute('data-id');
            removeNotification(notificationId, notificationCard);
        });
    });
    
    // Botões de aceitar convite
    document.querySelectorAll('.accept-invite-btn').forEach(btn => {
        btn.addEventListener('click', function(event) {
            event.preventDefault();
            const notificationCard = this.closest('.notification-card');
            const notificationId = notificationCard.getAttribute('data-id');
            acceptInvite(notificationId, notificationCard);
        });
    });
    
    // Botões de recusar convite
    document.querySelectorAll('.reject-invite-btn').forEach(btn => {
        btn.addEventListener('click', function(event) {
            event.preventDefault();
            const notificationCard = this.closest('.notification-card');
            const notificationId = notificationCard.getAttribute('data-id');
            rejectInvite(notificationId, notificationCard);
        });
    });
}

// Inicializar botão para limpar todas as notificações
function initClearAllButton() {
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (!clearAllBtn) return;
    
    clearAllBtn.addEventListener('click', function() {
        showConfirmDialog(
            'Limpar todas as notificações?',
            'Esta ação não poderá ser desfeita.',
            clearAllNotifications
        );
    });
}

// Inicializar botão para adicionar convite de demonstração
function initAddDemoInviteButton() {
    const addDemoInviteBtn = document.getElementById('add-demo-invite');
    if (!addDemoInviteBtn) return;
    
    addDemoInviteBtn.addEventListener('click', function() {
        addDemoInvite();
    });
}

// Marcar notificação como lida
function markNotificationAsRead(notificationId, card) {
    // Mostrar estado de carregamento
    const button = card.querySelector('.mark-read-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    
    // Fazer requisição para a API
    fetch(`/api/notificacoes/${notificationId}/lida`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao marcar notificação como lida');
        }
        return response.json();
    })
    .then(data => {
        // Atualizar visual da notificação
        card.classList.add('lida');
        
        // Remover botão de marcar como lida
        button.parentNode.removeChild(button);
        
        // Mostrar mensagem de sucesso
        showToast('Notificação marcada como lida', 'success');
        
        // Verificar se há notificações não lidas
        checkUnreadNotifications();
    })
    .catch(error => {
        console.error('Erro:', error);
        button.innerHTML = originalText;
        button.disabled = false;
        showToast('Erro ao marcar notificação como lida', 'error');
    });
}

// Remover notificação
function removeNotification(notificationId, card) {
    // Animar saída do card
    card.style.opacity = '0';
    card.style.height = card.offsetHeight + 'px';
    setTimeout(() => {
        card.style.height = '0';
        card.style.margin = '0';
        card.style.padding = '0';
    }, 300);
    
    // Fazer requisição para a API
    fetch(`/api/notificacoes/${notificationId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao remover notificação');
        }
        return response.json();
    })
    .then(data => {
        // Remover completamente após a animação
        setTimeout(() => {
            card.remove();
            
            // Verificar se há mais notificações
            checkIfEmpty();
            
            // Verificar se há notificações não lidas
            checkUnreadNotifications();
        }, 600);
        
        // Mostrar mensagem de sucesso
        showToast('Notificação removida', 'success');
    })
    .catch(error => {
        console.error('Erro:', error);
        card.style.opacity = '1';
        card.style.height = 'auto';
        showToast('Erro ao remover notificação', 'error');
    });
}

// Aceitar convite de grupo
function acceptInvite(notificationId, card) {
    // Mostrar estado de carregamento
    const button = card.querySelector('.accept-invite-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    
    // Desabilitar o botão de rejeitar também
    const rejectButton = card.querySelector('.reject-invite-btn');
    rejectButton.disabled = true;
    
    // Fazer requisição para a API
    fetch(`/api/convites/${notificationId}/aceitar`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao aceitar convite');
        }
        return response.json();
    })
    .then(data => {
        // Atualizar visual da notificação
        card.classList.add('lida');
        
        // Remover botões de ação
        const actionsContainer = card.querySelector('.notification-actions');
        actionsContainer.innerHTML = `
            <button class="action-btn read" disabled>
                <i class="fas fa-check-circle"></i> Aceito
            </button>
            <button class="action-btn remove remove-btn">
                <i class="fas fa-trash"></i> Remover
            </button>
        `;
        
        // Reinicializar botão de remover
        card.querySelector('.remove-btn').addEventListener('click', function() {
            removeNotification(notificationId, card);
        });
        
        // Mostrar mensagem de sucesso
        showToast('Convite aceito com sucesso', 'success');
        
        // Verificar se há notificações não lidas
        checkUnreadNotifications();
    })
    .catch(error => {
        console.error('Erro:', error);
        button.innerHTML = originalText;
        button.disabled = false;
        rejectButton.disabled = false;
        showToast('Erro ao aceitar convite', 'error');
    });
}

// Rejeitar convite de grupo
function rejectInvite(notificationId, card) {
    // Simplesmente removemos a notificação
    removeNotification(notificationId, card);
}

// Limpar todas as notificações
function clearAllNotifications() {
    // Fazer requisição para a API
    fetch('/api/notificacoes', {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao limpar notificações');
        }
        return response.json();
    })
    .then(data => {
        // Remover todas as notificações com animação
        const cards = document.querySelectorAll('.notification-card');
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.height = card.offsetHeight + 'px';
                setTimeout(() => {
                    card.style.height = '0';
                    card.style.margin = '0';
                    card.style.padding = '0';
                    
                    setTimeout(() => {
                        card.remove();
                        
                        // Se for o último card, verificar se está vazio
                        if (index === cards.length - 1) {
                            checkIfEmpty();
                        }
                    }, 300);
                }, 300);
            }, index * 100); // Efeito cascata
        });
        
        // Mostrar mensagem de sucesso
        showToast('Todas as notificações foram removidas', 'success');
        
        // Atualizar estado de notificações não lidas
        checkUnreadNotifications();
    })
    .catch(error => {
        console.error('Erro:', error);
        showToast('Erro ao limpar notificações', 'error');
    });
}

// Adicionar convite de demonstração
function addDemoInvite() {
    // Fazer requisição para a API
    fetch('/api/demo/adicionar-convite')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao adicionar convite de demonstração');
        }
        return response.json();
    })
    .then(data => {
        // Verificar se a página precisa ser recarregada
        const notificationsContainer = document.getElementById('notifications-container');
        if (!notificationsContainer) {
            window.location.reload();
            return;
        }
        
        // Criar elemento para o novo convite
        const convite = data.convite;
        const card = document.createElement('div');
        card.className = 'notification-card';
        card.setAttribute('data-id', convite.id);
        card.setAttribute('data-tipo', 'convite');
        card.style.opacity = '0';
        card.style.transform = 'translateY(-20px)';
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        
        card.innerHTML = `
            <div class="notification-icon convite">
                <i class="fas fa-user-plus"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${convite.titulo}</div>
                <div class="notification-text">${convite.mensagem}</div>
                <div class="notification-time">
                    ${new Date(convite.data).toLocaleString()}
                </div>
                
                <div class="notification-actions">
                    <button class="action-btn accept accept-invite-btn">
                        <i class="fas fa-check"></i> Aceitar
                    </button>
                    <button class="action-btn reject reject-invite-btn">
                        <i class="fas fa-times"></i> Recusar
                    </button>
                </div>
            </div>
        `;
        
        // Verificar se há container de notificações
        if (notificationsContainer) {
            // Adicionar ao início do container
            notificationsContainer.insertBefore(card, notificationsContainer.firstChild);
            
            // Animar entrada
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
            
            // Inicializar botões
            card.querySelector('.accept-invite-btn').addEventListener('click', function() {
                acceptInvite(convite.id, card);
            });
            
            card.querySelector('.reject-invite-btn').addEventListener('click', function() {
                rejectInvite(convite.id, card);
            });
        } else {
            // Não há container de notificações, recarregar a página
            window.location.reload();
            return;
        }
        
        // Verificar se botão de limpar todas já existe
        if (!document.getElementById('clear-all-btn')) {
            const headerActions = document.createElement('div');
            headerActions.className = 'header-actions';
            headerActions.innerHTML = `
                <button id="clear-all-btn" class="header-btn">
                    <i class="fas fa-trash-alt"></i> Limpar Todas
                </button>
            `;
            
            // Adicionar após o título
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) {
                pageTitle.after(headerActions);
                
                // Inicializar botão de limpar todas
                document.getElementById('clear-all-btn').addEventListener('click', function() {
                    showConfirmDialog(
                        'Limpar todas as notificações?',
                        'Esta ação não poderá ser desfeita.',
                        clearAllNotifications
                    );
                });
            }
        }
        
        // Remover estado vazio se existir
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        // Mostrar mensagem de sucesso
        showToast('Convite de demonstração adicionado', 'success');
        
        // Verificar notificações não lidas
        checkUnreadNotifications();
    })
    .catch(error => {
        console.error('Erro:', error);
        showToast(error.message || 'Erro ao adicionar convite de demonstração', 'error');
    });
}

// Verificar se não há mais notificações e exibir estado vazio
function checkIfEmpty() {
    const cards = document.querySelectorAll('.notification-card');
    
    if (cards.length === 0) {
        // Remover botão de limpar todas
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            const headerActions = clearAllBtn.closest('.header-actions');
            headerActions.remove();
        }
        
        // Criar estado vazio
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-bell-slash"></i>
            </div>
            <div class="empty-text">Não há notificações</div>
            <div class="empty-subtext">Suas notificações aparecerão aqui</div>
        `;
        
        // Adicionar à página
        const container = document.getElementById('notifications-container');
        if (container) {
            container.parentNode.insertBefore(emptyState, container);
            container.remove();
        } else {
            document.querySelector('.page-title').after(emptyState);
        }
    }
}

// Verificar se há notificações não lidas e animar o sino no menu
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

// Função para mostrar diálogo de confirmação
function showConfirmDialog(title, message, confirmCallback) {
    // Verificar se já existe um modal
    const existingModal = document.querySelector('.confirm-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Criar elementos do modal
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s';
    
    modal.innerHTML = `
        <div class="confirm-dialog" style="background-color: white; width: 80%; max-width: 350px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            <div class="confirm-header" style="padding: 15px; background-color: #0047CC; color: white;">
                <h3 style="margin: 0; font-size: 18px;">${title}</h3>
            </div>
            <div class="confirm-body" style="padding: 20px;">
                <p style="margin: 0; font-size: 14px; color: #555;">${message}</p>
            </div>
            <div class="confirm-footer" style="padding: 15px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #eee;">
                <button class="cancel-btn" style="padding: 8px 15px; background-color: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
                <button class="confirm-btn" style="padding: 8px 15px; background-color: #0047CC; color: white; border: none; border-radius: 4px; cursor: pointer;">Confirmar</button>
            </div>
        </div>
    `;
    
    // Adicionar à página
    document.body.appendChild(modal);
    
    // Animar entrada
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Adicionar eventos
    modal.querySelector('.cancel-btn').addEventListener('click', function() {
        closeModal();
    });
    
    modal.querySelector('.confirm-btn').addEventListener('click', function() {
        closeModal();
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
    });
    
    // Fechar quando clicar fora
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Função para fechar o modal
    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Função para mostrar toast
function showToast(message, type = 'info', duration = 3000) {
    // Remover toast existente
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Definir cor baseada no tipo
    let backgroundColor, icon;
    switch (type) {
        case 'success':
            backgroundColor = '#4CAF50';
            icon = 'check-circle';
            break;
        case 'error':
            backgroundColor = '#F44336';
            icon = 'times-circle';
            break;
        default:
            backgroundColor = '#2196F3';
            icon = 'info-circle';
    }
    
    // Estilizar o toast
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';  // Acima do menu de navegação
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.padding = '12px 20px';
    toast.style.backgroundColor = backgroundColor;
    toast.style.color = 'white';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    toast.style.zIndex = '999';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.minWidth = '250px';
    toast.style.maxWidth = '80%';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}" style="margin-right: 10px;"></i>
        <span>${message}</span>
    `;
    
    // Adicionar à página
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Remover após a duração
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
} 