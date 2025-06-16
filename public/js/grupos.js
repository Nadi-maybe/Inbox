
document.addEventListener('DOMContentLoaded', () => {
    initGrupos();
});


function initGrupos() {
    
    const groupItems = document.querySelectorAll('.group-item');
    groupItems.forEach(item => {
        item.addEventListener('click', () => {
            
            groupItems.forEach(g => g.classList.remove('active'));
            
            item.classList.add('active');
            
            const grupoId = item.dataset.id;
            const grupoNome = item.querySelector('.group-name').textContent;
            
            
            document.getElementById('grupo-nome').textContent = grupoNome;
            
            
            loadProdutos(grupoId);
            
            
            document.getElementById('produtos-container').style.display = 'block';
            document.getElementById('back-button').style.display = 'block';
        });
    });
    
    
    document.getElementById('back-button').addEventListener('click', () => {
        
        groupItems.forEach(g => g.classList.remove('active'));
        
        
        document.getElementById('produtos-container').style.display = 'none';
        document.getElementById('back-button').style.display = 'none';
    });
    
    
    initSearch();
}


function initSearch() {
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        
        if (document.getElementById('produtos-container').style.display === 'block') {
            
            filterProdutos(searchTerm);
        } else {
            
            filterGrupos(searchTerm);
        }
    });
}


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


function loadProdutos(grupoId) {
    const produtosList = document.getElementById('produtos-list');
    produtosList.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando produtos...</p>
        </div>
    `;
    
    
    document.getElementById('no-produtos').style.display = 'none';
    
    
    fetch(`/api/produtos/grupo/${grupoId}`)
        .then(response => response.json())
        .then(produtos => {
            
            produtosList.innerHTML = '';
            
            
            if (produtos.length > 0) {
                
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
        
        noProdutos.style.display = 'flex';
        noProdutos.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-search"></i>
            </div>
            <p>Nenhum produto encontrado</p>
        `;
    } else {
        
        noProdutos.style.display = 'none';
    }
} 