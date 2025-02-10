const carrinhoDeCompras = [];

function salvarDados() {
    localStorage.setItem('carrinho', JSON.stringify(carrinhoDeCompras));
}

function recuperarDados() {
    let dadosSalvos = localStorage.getItem('carrinho');
    if (dadosSalvos) {
        carrinhoDeCompras.length = 0;
        JSON.parse(dadosSalvos).forEach(item => carrinhoDeCompras.push(item));
    }
    preencherCarrinho();
}

// Função para obter os itens do carrinho a partir do localStorage
function getCarrinho() {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
}

// Função para agrupar produtos pelo título
function agruparProdutos(produtos) {
    let grupos = {};
    produtos.forEach(prod => {
        if (grupos[prod.title]) {
            grupos[prod.title].quantidade++;
        } else {
            grupos[prod.title] = { ...prod, quantidade: 1 };
        }
    });
    return grupos;
}

// Função helper que retorna o HTML modular para um grupo de produto
function renderCartItemModule(prod, aumentarFunc, diminuirFunc) {
    let valor = parseFloat(prod.price.split("R$")[1].trim().replace(",", "."));
    return `
      <div class="cart-item-module">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <strong>${prod.title}</strong><br>
                <small>Preço Unitário: ${prod.price}</small><br>
                <small>
                    Qtd:
                    <button class="btn btn-sm btn-outline-secondary" onclick="${diminuirFunc}(event, '${prod.title}')">-</button>
                    ${prod.quantidade}
                    <button class="btn btn-sm btn-outline-secondary" onclick="${aumentarFunc}(event, '${prod.title}')">+</button>
                </small>
            </div>
            <img src="${prod.image}" alt="${prod.title}" style="width:40px; height:40px; object-fit:cover;">
        </div>
      </div>`;
}

// Função para preencher o carrinho no dropdown
function preencherCarrinho() {
    const carrinho = document.getElementById("carrinhoCompras");
    carrinho.innerHTML = ""; // limpa itens anteriores

    let produtos = getCarrinho();
    if (produtos.length === 0) {
        carrinho.innerHTML = '<li class="dropdown-item text-center">Seu carrinho está vazio</li>';
        atualizarContador();
        return;
    }

    const grupos = agruparProdutos(produtos);
    let total = 0;
    for (let title in grupos) {
        let prod = grupos[title];
        let valor = parseFloat(prod.price.split("R$")[1].trim().replace(",", "."));
        total += valor * prod.quantidade;
        // Insere o módulo do produto no dropdown
        let li = document.createElement("li");
        li.className = "dropdown-item";
        li.innerHTML = renderCartItemModule(prod, 'aumentarQuantidadeDropdown', 'diminuirQuantidadeDropdown');
        carrinho.appendChild(li);
    }

    let liTotal = document.createElement("li");
    liTotal.className = "dropdown-item text-center";
    liTotal.innerHTML = `<strong>Total: R$ ${total.toFixed(2).replace(".", ",")}</strong>`;
    carrinho.appendChild(liTotal);

    let liLimpar = document.createElement("li");
    liLimpar.className = "dropdown-item text-center";
    liLimpar.innerHTML = `<button class="btn btn-danger btn-sm" onclick="limparCarrinho()">Limpar Carrinho</button>`;
    carrinho.appendChild(liLimpar);

    let liFinalizar = document.createElement("li");
    liFinalizar.className = "dropdown-item text-center";
    liFinalizar.innerHTML = `<button class="btn btn-success btn-sm" onclick="finalizarCompra()">Finalizar Compra</button>`;
    carrinho.appendChild(liFinalizar);

    atualizarContador();
}

// Funções para ajustar quantidade no dropdown mantendo o dropdown aberto
function ajustarQuantidade(e, title, incremento, callback) {
    if (e) e.stopPropagation();
    let produtos = getCarrinho();
    if (incremento > 0) {
        let prod = produtos.find(p => p.title === title);
        if (prod) produtos.push(prod);
    } else {
        let index = produtos.findIndex(p => p.title === title);
        if (index !== -1) produtos.splice(index, 1);
    }
    localStorage.setItem('carrinho', JSON.stringify(produtos));
    callback();
}

function aumentarQuantidadeDropdown(e, title) {
    ajustarQuantidade(e, title, 1, preencherCarrinho);
}

function diminuirQuantidadeDropdown(e, title) {
    ajustarQuantidade(e, title, -1, preencherCarrinho);
}

// Adaptação da lista para a página finalizar.html
function gerarListaFinalizar() {
    const lista = document.getElementById('listaProdutos');
    const totalEl = document.getElementById('totalFinal');
    if (!lista || !totalEl) return;
    lista.innerHTML = "";

    let produtos = getCarrinho();
    if (produtos.length === 0) {
        lista.innerHTML = "<li class='list-group-item text-center'>Seu carrinho está vazio</li>";
        totalEl.innerText = "Total: R$ 0,00";
        return;
    }

    const grupos = agruparProdutos(produtos);
    let total = 0;
    for (let key in grupos) {
        let prod = grupos[key];
        let valor = parseFloat(prod.price.split("R$")[1].trim().replace(",", "."));
        let subtotal = valor * prod.quantidade;
        total += subtotal;
        lista.innerHTML += renderCartItemModule(prod, 'aumentarQuantidade', 'diminuirQuantidade');
    }
    totalEl.innerText = "Total: R$ " + total.toFixed(2).replace(".", ",");
}

// Funções para ajustes de quantidade na página finalizar
function aumentarQuantidade(e, title) {
    ajustarQuantidade(e, title, 1, gerarListaFinalizar);
}

function diminuirQuantidade(e, title) {
    ajustarQuantidade(e, title, -1, gerarListaFinalizar);
}

// Funções para manipulação do carrinho
function removerProduto(index, event) {
    event.stopPropagation();
    carrinhoDeCompras.splice(index, 1);
    salvarDados();
    preencherCarrinho();
}

function adicionarProduto(botao) {
    let produtoCard = botao.closest('.col-lg-4, .col-md-3, .col-md-4');
    let image = produtoCard.querySelector('img').src;
    let title = produtoCard.querySelector('p').innerText;
    let price = produtoCard.querySelector('h6').innerText;
    carrinhoDeCompras.push({ image, title, price });
    salvarDados();
    preencherCarrinho();
}

function finalizarCompra() {
    let path = window.location.pathname.includes('pages') ? '../pages/finalizar.html' : 'pages/finalizar.html';
    window.location.href = path;
}

function limparCarrinho() {
    carrinhoDeCompras.length = 0;
    salvarDados();
    preencherCarrinho();
}

function atualizarContador() {
    const countElement = document.getElementById("cartCount");
    if (countElement) {
        const qtd = getCarrinho().length;
        if (qtd === 0) {
            countElement.style.display = "none";
        } else {
            countElement.style.display = "inline-block";
            countElement.innerText = qtd;
        }
    }
}

function mostrarOpcoes() {
    document.getElementById("botaoPix").style.display = "none";
    document.getElementById("formCartao").style.display = "none";
    document.getElementById("imagemCodigo").style.display = "none";

    let valorTotal = document.getElementById("totalFinal").innerText;

    if (document.getElementById("pix").checked) {
        document.getElementById("botaoPix").style.display = "block";
    } else if (document.getElementById("cartao").checked) {
        document.getElementById("formCartao").style.display = "block";
        document.getElementById("valorPagamentoCartao").innerText = valorTotal;
    }
}

function gerarCodigoQr() {
    document.getElementById("botaoPix").style.display = "none";
    document.getElementById("formCartao").style.display = "none";
    document.getElementById("imagemCodigo").style.display = "block";

    let valorTotal = document.getElementById("totalFinal").innerText;
    document.getElementById("valorPagamentoPix").innerText = valorTotal;
}

function confirmarCompra () {
    let path = window.location.pathname.includes('pages') ? '../home.html' : 'home.html';
    window.location.href = path;
    limparCarrinho();
    return true;
}

function validarCompra() {
    let opcaoCartao = document.getElementById("cartao").checked;

    if (opcaoCartao) {
        let form = document.getElementById("formCartao");
        let campos = form.querySelectorAll("input[required]");
        let valido = true;

        for (let campo of campos) {
            if (!campo.value) {
                valido = false;
                break;
            }
        }

        if (!valido) {
            let incompleto = document.getElementById("mensagemCompra");
            incompleto.innerText = "Preencha todos os campos do cartão.";
            incompleto.style.color = "red";
            
            return false;
        }
    } else {
        contadorTempo();
    }
    contadorTempo();
}

function contadorTempo() {
    let tempo = 10;
    let mensagem = document.getElementById("mensagemCompra");

    const intervalo = setInterval(() => {
        if (tempo <= 0) {
            clearInterval(intervalo);
            confirmarCompra();
            return;
        }

        mensagem.innerText = `Compra realizada com sucesso. Você será redirecionado em: ${tempo} s`;
        mensagem.style.color = "green";
        tempo--;
    }, 1000);
}
