// produtos.js - Funcionalidades específicas da página de produtos

document.addEventListener('DOMContentLoaded', function() {
    initProdutos();
});

// Inicializar página de produtos
function initProdutos() {
    initGroupSelection();
    initSearchInput();
    initBackButton();
}

// Inicializar seleção de grupos
function initGroupSelection() {
    const groupItems = document.querySelectorAll('.group-item');
    
    groupItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remover classe 'active' de todos os grupos
            document.querySelectorAll('.group-item').forEach(g => g.classList.remove('active'));
            
            // Adicionar classe 'active' ao grupo clicado
            this.classList.add('active');
            
            // Obter o ID e o nome do grupo
            const groupId = this.getAttribute('data-id');
            const groupName = this.querySelector('.group-name').textContent;
            
            // Exibir o nome do grupo na seção de produtos
            document.getElementById('grupo-nome').textContent = groupName;
            
            // Carregar produtos do grupo selecionado
            loadProductsFromGroup(groupId);
            
            // Exibir seção de produtos e botão voltar
            document.getElementById('produtos-container').style.display = 'block';
            document.getElementById('back-button').style.display = 'flex';
            
            // Esconder a seção de grupos
            document.querySelector('.card-overlap').style.display = 'none';
        });
    });
}

// Inicializar botão voltar
function initBackButton() {
    const backButton = document.getElementById('back-button');
    
    backButton.addEventListener('click', function() {
        // Esconder seção de produtos e botão voltar
        document.getElementById('produtos-container').style.display = 'none';
        this.style.display = 'none';
        
        // Exibir a seção de grupos
        document.querySelector('.card-overlap').style.display = 'block';
        
        // Limpar seleção ativa
        document.querySelectorAll('.group-item').forEach(g => g.classList.remove('active'));
        
        // Limpar busca
        document.getElementById('search-input').value = '';
    });
}

// Inicializar busca de produtos
function initSearchInput() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        // Verificar se estamos na visualização de produtos
        if (document.getElementById('produtos-container').style.display === 'block') {
            // Filtrar produtos
            filterProdutos(searchTerm);
        } else {
            // Filtrar grupos
            filterGroups(searchTerm);
        }
    });
}

// Filtrar grupos com base no termo de busca
function filterGroups(searchTerm) {
    const groupItems = document.querySelectorAll('.group-item');
    let visibleCount = 0;
    
    groupItems.forEach(item => {
        const groupName = item.querySelector('.group-name').textContent.toLowerCase();
        
        if (groupName.includes(searchTerm)) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Se não houver grupos visíveis, mostrar mensagem
    const emptyState = document.querySelector('.card-overlap .empty-state');
    if (emptyState && groupItems.length > 0) {
        if (visibleCount === 0 && searchTerm) {
            const existingMessage = emptyState.querySelector('.search-no-result');
            
            if (!existingMessage) {
                const noResultMessage = document.createElement('p');
                noResultMessage.className = 'search-no-result';
                noResultMessage.textContent = 'Nenhum grupo encontrado com este termo de busca.';
                emptyState.appendChild(noResultMessage);
            }
            
            emptyState.style.display = 'flex';
        } else {
            const existingMessage = emptyState.querySelector('.search-no-result');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            emptyState.style.display = visibleCount > 0 ? 'none' : 'flex';
        }
    }
}

// Carregar produtos do grupo selecionado
function loadProductsFromGroup(groupId) {
    // Exibir estado de carregamento
    const produtosList = document.getElementById('produtos-list');
    produtosList.innerHTML = `
        <div class="loading-state" style="text-align: center; padding: 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #0047CC;"></i>
            <p>Carregando produtos...</p>
        </div>
    `;
    
    // Ocultar mensagem de "nenhum produto"
    document.getElementById('no-produtos').style.display = 'none';
    
    // Fazer requisição para a API
    fetch(`/api/produtos/grupo/${groupId}`)
        .then(response => response.json())
        .then(produtos => {
            // Limpar lista de produtos
            produtosList.innerHTML = '';
            
            // Verificar se há produtos
            if (produtos.length > 0) {
                // Renderizar cada produto
                produtos.forEach(produto => {
                    const produtoCard = document.createElement('div');
                    produtoCard.className = 'produto-card';
                    produtoCard.dataset.id = produto.id;
                    produtoCard.innerHTML = `
                        <h4>${produto.nome}</h4>
                        <p>${produto.descricao || 'Sem descrição'}</p>
                        <div class="btn-container">
                            <button class="reserve-btn" data-id="${produto.id}">
                                <i class="fas fa-hand-holding"></i> Reservar
                            </button>
                        </div>
                    `;
                    
                    // Adicionar evento ao botão de reserva
                    const reserveBtn = produtoCard.querySelector('.reserve-btn');
                    reserveBtn.addEventListener('click', function(event) {
                        event.stopPropagation(); // Evitar propagação do clique
                        const produtoId = this.getAttribute('data-id');
                        showReserveConfirmation(produtoId, produto.nome);
                    });
                    
                    // Adicionar à lista
                    produtosList.appendChild(produtoCard);
                });
            } else {
                // Exibir mensagem de "nenhum produto"
                document.getElementById('no-produtos').style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
            produtosList.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 20px; color: #f44336;">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px;"></i>
                    <p>Erro ao carregar produtos. Tente novamente.</p>
                </div>
            `;
        });
}

// Filtrar produtos com base no termo de busca
function filterProdutos(searchTerm) {
    const produtoCards = document.querySelectorAll('.produto-card');
    let visibleCount = 0;
    
    produtoCards.forEach(card => {
        const produtoNome = card.querySelector('h4').textContent.toLowerCase();
        const produtoDescricao = card.querySelector('p').textContent.toLowerCase();
        
        if (produtoNome.includes(searchTerm) || produtoDescricao.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Verificar se há resultados visíveis
    const noProdutos = document.getElementById('no-produtos');
    const produtosList = document.getElementById('produtos-list');
    
    if (visibleCount === 0 && produtoCards.length > 0 && searchTerm) {
        // Não há resultados para a busca
        noProdutos.style.display = 'flex';
        noProdutos.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-search"></i>
            </div>
            <p>Nenhum produto encontrado com o termo "${searchTerm}"</p>
        `;
    } else if (produtoCards.length === 0) {
        // Não há produtos no grupo
        noProdutos.style.display = 'flex';
        noProdutos.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-box-open"></i>
            </div>
            <p>Nenhum produto disponível neste grupo</p>
        `;
    } else {
        // Há produtos visíveis
        noProdutos.style.display = 'none';
    }
}

// Mostrar confirmação de reserva
function showReserveConfirmation(produtoId, produtoNome) {
    // Criar modal de confirmação
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Confirmar Reserva</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p>Deseja reservar o produto "<strong>${produtoNome}</strong>"?</p>
                <div class="form-group">
                    <label for="prazo">Prazo de devolução:</label>
                    <input type="date" id="prazo" min="${getTomorrowDate()}" required>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn">Cancelar</button>
                <button class="confirm-btn">Confirmar</button>
            </div>
        </div>
    `;
    
    // Estilizar o modal
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
    modalContent.style.maxWidth = '400px';
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
    
    const formGroup = modal.querySelector('.form-group');
    formGroup.style.marginTop = '15px';
    
    const label = formGroup.querySelector('label');
    label.style.display = 'block';
    label.style.marginBottom = '5px';
    
    const input = formGroup.querySelector('input');
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #ddd';
    
    const modalFooter = modal.querySelector('.modal-footer');
    modalFooter.style.padding = '15px';
    modalFooter.style.borderTop = '1px solid #ddd';
    modalFooter.style.display = 'flex';
    modalFooter.style.justifyContent = 'flex-end';
    modalFooter.style.gap = '10px';
    
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
    
    // Adicionar evento para fechar o modal
    closeModal.addEventListener('click', function() {
        modal.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 280);
    });
    
    // Adicionar evento para clicar fora e fechar
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 280);
        }
    });
    
    // Adicionar evento ao botão cancelar
    cancelBtn.addEventListener('click', function() {
        modal.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 280);
    });
    
    // Adicionar evento ao botão confirmar
    confirmBtn.addEventListener('click', function() {
        const prazo = document.getElementById('prazo').value;
        
        if (!prazo) {
            // Destacar campo obrigatório
            input.style.border = '1px solid #f44336';
            input.style.boxShadow = '0 0 3px #f44336';
            
            // Mostrar mensagem
            if (!formGroup.querySelector('.error-message')) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Informe um prazo para devolução';
                errorMessage.style.color = '#f44336';
                errorMessage.style.fontSize = '12px';
                errorMessage.style.marginTop = '5px';
                formGroup.appendChild(errorMessage);
            }
            
            return;
        }
        
        // Simular ação de reserva
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        this.disabled = true;
        
        // Simular delay de processamento
        setTimeout(() => {
            // Fechar modal
            modal.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 280);
            
            // Exibir mensagem de sucesso
            showToast(`Produto "${produtoNome}" reservado com sucesso!`, 'success');
            
            // Adicionar o produto à lista de registros (em um app real, seria via API)
            addRegistro(produtoId, produtoNome, formatarData(prazo));
        }, 1000);
    });
    
    // Adicionar o modal ao corpo do documento
    document.body.appendChild(modal);
    
    // Adicionar keyframes para animações (caso não existam)
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

// Obter a data de amanhã no formato YYYY-MM-DD
function getTomorrowDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Formatar data de YYYY-MM-DD para DD/MM/YYYY
function formatarData(dataStr) {
    const partes = dataStr.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Adicionar um registro de produto reservado
function addRegistro(produtoId, produtoNome, prazo) {
    // Em um app real, isso seria feito via API
    // Por enquanto, é apenas visual
    
    // Criar objeto de registro
    const registro = {
        id: `reg-${Date.now()}`,
        nome: produtoNome,
        data: prazo
    };
    
    // Apenas simular que o registro foi adicionado
    console.log('Registro adicionado:', registro);
}

// Função para mostrar um toast de notificação
function showToast(message, type = 'info') {
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        </div>
        <div class="toast-message">${message}</div>
    `;
    
    // Estilizar o toast
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
    
    // Adicionar ao corpo do documento
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Remover após alguns segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
} 