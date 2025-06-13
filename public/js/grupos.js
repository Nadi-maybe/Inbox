// grupos.js - Funcionalidades específicas da página de grupos

document.addEventListener('DOMContentLoaded', () => {
    initGrupos();
});

// Inicializar página de grupos
function initGrupos() {
    // Adicionar eventos de clique aos grupos
    const groupItems = document.querySelectorAll('.group-item');
    groupItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover classe active de todos os grupos
            groupItems.forEach(g => g.classList.remove('active'));
            // Adicionar classe active ao grupo clicado
            item.classList.add('active');
            
            const grupoId = item.dataset.id;
            const grupoNome = item.querySelector('.group-name').textContent;
            
            // Exibir o nome do grupo na seção de produtos
            document.getElementById('grupo-nome').textContent = grupoNome;
            
            // Carregar produtos do grupo selecionado
            loadProdutos(grupoId);
            
            // Exibir seção de produtos e botão voltar
            document.getElementById('produtos-container').style.display = 'block';
            document.getElementById('back-button').style.display = 'block';
        });
    });
    
    // Adicionar evento ao botão voltar
    document.getElementById('back-button').addEventListener('click', () => {
        // Remover classe active de todos os grupos
        groupItems.forEach(g => g.classList.remove('active'));
        
        // Esconder seção de produtos e botão voltar
        document.getElementById('produtos-container').style.display = 'none';
        document.getElementById('back-button').style.display = 'none';
    });
    
    // Inicializar busca
    initSearch();
}

// Inicializar busca
function initSearch() {
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        // Verificar se estamos na visualização de produtos
        if (document.getElementById('produtos-container').style.display === 'block') {
            // Filtrar produtos
            filterProdutos(searchTerm);
        } else {
            // Filtrar grupos
            filterGrupos(searchTerm);
        }
    });
}

// Filtrar grupos com base no termo de busca
function filterGrupos(searchTerm) {
    const groupItems = document.querySelectorAll('.group-item');
    let hasVisibleGroups = false;
    
    groupItems.forEach(item => {
        const groupName = item.querySelector('.group-name').textContent.toLowerCase();
        if (groupName.includes(searchTerm)) {
            item.style.display = 'flex';
            hasVisibleGroups = true;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Mostrar ou esconder mensagem de "nenhum grupo encontrado"
    const emptyState = document.querySelector('.empty-state');
    if (!hasVisibleGroups) {
        emptyState.style.display = 'flex';
        emptyState.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-search"></i>
            </div>
            <p>Nenhum grupo encontrado</p>
        `;
    } else {
        emptyState.style.display = 'none';
    }
}

// Carregar produtos do grupo selecionado
function loadProdutos(grupoId) {
    const produtosList = document.getElementById('produtos-list');
    produtosList.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando produtos...</p>
        </div>
    `;
    
    // Esconder mensagem de "nenhum produto"
    document.getElementById('no-produtos').style.display = 'none';
    
    // Buscar produtos do grupo
    fetch(`/api/produtos/grupo/${grupoId}`)
        .then(response => response.json())
        .then(produtos => {
            // Limpar lista de produtos
            produtosList.innerHTML = '';
            
            // Verificar se há produtos
            if (produtos.length > 0) {
                // Criar cards para cada produto
                produtos.forEach(produto => {
                    const produtoCard = document.createElement('div');
                    produtoCard.className = 'produto-card';
                    produtoCard.innerHTML = `
                        <h4>${produto.name}</h4>
                        <p>${produto.description}</p>
                        <div class="btn-container">
                            <button class="reserve-btn" data-id="${produto.id}">
                                <i class="fas fa-calendar-plus"></i>
                                Reservar
                            </button>
                        </div>
                    `;
                    produtosList.appendChild(produtoCard);
                });
            } else {
                // Mostrar mensagem de "nenhum produto"
                document.getElementById('no-produtos').style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
            produtosList.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Erro ao carregar produtos. Tente novamente.</p>
                </div>
            `;
        });
}

// Filtrar produtos com base no termo de busca
function filterProdutos(searchTerm) {
    const produtoCards = document.querySelectorAll('.produto-card');
    let hasVisibleProdutos = false;
    
    produtoCards.forEach(card => {
        const produtoName = card.querySelector('h4').textContent.toLowerCase();
        const produtoDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (produtoName.includes(searchTerm) || produtoDesc.includes(searchTerm)) {
            card.style.display = 'block';
            hasVisibleProdutos = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    const noProdutos = document.getElementById('no-produtos');
    const produtosList = document.getElementById('produtos-list');
    
    if (!hasVisibleProdutos) {
        // Não há produtos no grupo
        noProdutos.style.display = 'flex';
        noProdutos.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-search"></i>
            </div>
            <p>Nenhum produto encontrado</p>
        `;
    } else {
        // Há produtos visíveis
        noProdutos.style.display = 'none';
    }
} 