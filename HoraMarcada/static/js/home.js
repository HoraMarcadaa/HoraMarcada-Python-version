
document.addEventListener('DOMContentLoaded', function () {

    // Mapeamento de imagens de período
    const periodosImagens = {
    'manha': '/static/img/Sol.png',
    'tarde': '/static/img/nuvem (1).png',
    'noite': '/static/img/Lua.png'
};

// Exemplo de uso
const imgElement = document.createElement('img');
imgElement.src = periodosImagens['manha']; // Pode mudar para 'tarde' ou 'noite' conforme necessário
imgElement.alt = 'Imagem de manhã';
document.body.appendChild(imgElement);



    // Função para atualizar o conteúdo de LaranjaDia e LaranjaPeriodo
    function atualizarInfoCalendario(dia, periodo) {
        const laranjaDia = document.querySelector('.LaranjaDia .CalendarioDia');
        const laranjaPeriodo = document.querySelector('.LaranjaPeriodo img');

        // Verifica se os elementos existem no DOM antes de tentar modificá-los
        if (laranjaDia && laranjaPeriodo) {
            // Atualiza o número do dia
            laranjaDia.textContent = dia;

            // Atualiza a imagem do período
            if (periodo in periodosImagens) {
                laranjaPeriodo.src = periodosImagens[periodo];
                laranjaPeriodo.alt = periodo;
            } else {
                laranjaPeriodo.src = '';
                laranjaPeriodo.alt = 'null';
            }
        } else {
            console.error("Elementos '.LaranjaDia' ou '.LaranjaPeriodo img' não foram encontrados.");
        }
    }

    // Função para configurar os eventos de clique nos quadrados
    function configurarCliquesNosQuadrados() {
        const quadrados = document.querySelectorAll('.Quadrado, .Quadrado1, .Quadrado2, .Quadrado3, .Quadrado4, .Quadrado5, .Quadrado6, .Quadrado7, .Quadrado8, .Quadrado9, .Quadrado10, .Quadrado11, .Quadrado12, .Quadrado13, .Quadrado14, .Quadrado15, .Quadrado16, .Quadrado17, .Quadrado18, .Quadrado19, .Quadrado20, .Quadrado21'); // Seleciona todos os quadrados

        quadrados.forEach(quadrado => {
            quadrado.addEventListener('click', function () {
                const dia = this.getAttribute('data-dia'); // Pega o dia do quadrado
                const periodo = this.getAttribute('data-periodo'); // Pega o período do quadrado

                // Atualiza as informações de dia e período
                atualizarInfoCalendario(dia, periodo);

               
            });
        });
    }
    
    // Função para formatar a data como dia e mês (sem nome do dia da semana)
    function formatarDiaMes(data) {
        return `${data.getDate()}/${data.getMonth() + 1}`;
    }

    // Função para obter a próxima semana
    function proximaSemana(data) {
        const novaData = new Date(data);
        novaData.setDate(novaData.getDate() + 7);
        return novaData;
    }

    // Função para obter a semana anterior
    function semanaAnterior(data) {
        const novaData = new Date(data);
        novaData.setDate(novaData.getDate() - 7);
        return novaData;
    }

    // Inicializa a data atual
    let dataAtual = new Date(2024, 8, 20);

    // Função para atualizar o calendário com base na data
    function atualizarCalendario(dataInicial) {
        const diasCalendario = [
            document.querySelector('.div'),
            document.querySelector('.div2'),
            document.querySelector('.div3'),
            document.querySelector('.div4 p'),
            document.querySelector('.div5 p'),
            document.querySelector('.div6'),
            document.querySelector('.div1'),
        ];

        // Atualiza cada dia da semana (sem o nome do dia da semana)
        for (let i = 0; i < diasCalendario.length; i++) {
            const data = new Date(dataInicial);
            data.setDate(dataInicial.getDate() + i);
            if (diasCalendario[i]) {
                diasCalendario[i].innerHTML = formatarDiaMes(data);
            }
        }

        // Atualiza os dias dos quadrados conforme a semana exibida
        atualizarDiasQuadrados(dataInicial);
    }

    // Função para atualizar os dias e períodos nos quadrados conforme a data inicial da semana
    function atualizarDiasQuadrados(dataInicial) {
        // Mapeamento dos quadrados por colunas (cada coluna tem 3 quadrados: manhã, tarde e noite)
        const colunas = [
            ['.Quadrado19', '.Quadrado7', '.Quadrado13'],
            ['.Quadrado2', '.Quadrado8', '.Quadrado14'],
            ['.Quadrado1', '.Quadrado9', '.Quadrado21'],
            ['.Quadrado3', '.Quadrado10', '.Quadrado15'],
            ['.Quadrado4', '.Quadrado20', '.Quadrado16'],
            ['.Quadrado5', '.Quadrado11', '.Quadrado17'],
            ['.Quadrado6', '.Quadrado12', '.Quadrado18']
        ];

        // Para cada dia (7 colunas)
        for (let i = 0; i < colunas.length; i++) {
            const data = new Date(dataInicial);
            data.setDate(dataInicial.getDate() + i); // Atualiza o dia conforme a coluna

            // Atualiza cada quadrado da coluna com o respectivo período (manhã, tarde e noite)
            document.querySelector(colunas[i][0]).setAttribute('data-dia', formatarDiaMes(data));
            document.querySelector(colunas[i][0]).setAttribute('data-periodo', 'manha');

            document.querySelector(colunas[i][1]).setAttribute('data-dia', formatarDiaMes(data));
            document.querySelector(colunas[i][1]).setAttribute('data-periodo', 'tarde');

            document.querySelector(colunas[i][2]).setAttribute('data-dia', formatarDiaMes(data));
            document.querySelector(colunas[i][2]).setAttribute('data-periodo', 'noite');
        }
    }

    // Função para avançar para a próxima semana
    function proximoDias() {
        dataAtual = proximaSemana(dataAtual);
        atualizarCalendario(dataAtual);
    }

    // Função para voltar para a semana anterior
    function anteriorDias() {
        dataAtual = semanaAnterior(dataAtual);
        atualizarCalendario(dataAtual);
    }

    // Inicializando o calendário e configuração de eventos
    atualizarCalendario(dataAtual);
    configurarCliquesNosQuadrados();

    // Configura as setas para mudar os dias
    document.querySelector('.Esquerda').addEventListener('click', anteriorDias);
    document.querySelector('.Direita').addEventListener('click', proximoDias);


});

/// Variáveis para armazenar o estado de cada quadrado
let estadoQuadrados = {};

// Função para carregar reservas salvas ao mudar de semana
function carregarReservasSalvas(dataInicial) {
    const semana = formatarSemana(dataInicial); // Ex: '20/09/2024 - 26/09/2024'
    
    fetch(`/buscar_reservas?semana=${semana}`)
        .then(response => response.json())
        .then(data => {
            // Atualize o estado dos quadrados com base nas reservas salvas
            data.quadrados.forEach(quadrado => {
                const idQuadrado = quadrado.dia + '-' + quadrado.periodo;
                const elemento = document.querySelector(`[data-dia="${quadrado.dia}"][data-periodo="${quadrado.periodo}"]`);
                
                if (elemento) {
                    elemento.style.backgroundColor = "#90d81d"; // Verde para confirmado
                    estadoQuadrados[idQuadrado] = 'confirmado'; // Marca como confirmado
                    elemento.innerHTML = ''; // Limpa o quadrado
                    let textoConfirmado = document.createElement("div");
                    textoConfirmado.className = "confirmado";
                    textoConfirmado.textContent = "confirmado";
                    elemento.appendChild(textoConfirmado); // Adiciona texto "confirmado"
                }
            });
        })
        .catch(error => console.error('Erro ao carregar reservas:', error));
}

// Chama a função assim que a página carrega para exibir as reservas salvas
window.onload = function() {
    const dataInicial = new Date();  // Pegue a data de hoje, ou use outra data base
    carregarReservasSalvas(dataInicial);  // Carrega as reservas da semana atual
}

// Função para lidar com a seleção de quadrados
document.querySelectorAll(".Quadrado1, .Quadrado2, .Quadrado3, .Quadrado4, .Quadrado5, .Quadrado6, .Quadrado7, .Quadrado8, .Quadrado9, .Quadrado10, .Quadrado11, .Quadrado12, .Quadrado13, .Quadrado14, .Quadrado15, .Quadrado16, .Quadrado17, .Quadrado18")
    .forEach(quadrado => {
        quadrado.addEventListener("click", function () {
            const idQuadrado = this.dataset.dia + '-' + this.dataset.periodo;

            if (!estadoQuadrados[idQuadrado]) {
                // Se o quadrado estiver branco, ele é selecionado (laranja)
                this.style.backgroundColor = "#FFA755"; // cor laranja de selecionado
                estadoQuadrados[idQuadrado] = 'selecionado';

                // Adiciona texto "selecionado" ao quadrado
                let textoSelecionado = document.createElement("div");
                textoSelecionado.className = "selecionado"; // Aplicando a classe de CSS
                textoSelecionado.textContent = "selecionado"; // Texto a ser exibido
                this.appendChild(textoSelecionado); // Adiciona ao quadrado
            } else if (estadoQuadrados[idQuadrado] === 'selecionado') {
                // Se ele já estiver selecionado, muda para confirmado (verde)
                this.style.backgroundColor = "#90d81d"; // cor verde de confirmado
                estadoQuadrados[idQuadrado] = 'confirmado';

                // Remove o texto "selecionado" e adiciona "confirmado"
                this.innerHTML = ''; // Limpa o conteúdo do quadrado
                let textoConfirmado = document.createElement("div");
                textoConfirmado.className = "confirmado"; // Aplicando a classe de CSS
                textoConfirmado.textContent = "confirmado"; // Texto a ser exibido
                this.appendChild(textoConfirmado); // Adiciona ao quadrado
            }
        });
    });

// Botão de cancelamento e confirmação já estão funcionando.

// Função para lidar com a confirmação dos quadrados
document.querySelector(".BotaoConfirmar").addEventListener("click", function () {
    let quadradosConfirmados = [];

    // Itera por todos os quadrados e verifica quais foram confirmados
    document.querySelectorAll(
        ".Quadrado1, .Quadrado2, .Quadrado3, .Quadrado4, .Quadrado5, .Quadrado6, .Quadrado7, .Quadrado8, .Quadrado9, .Quadrado10, .Quadrado11, .Quadrado12, .Quadrado13, .Quadrado14, .Quadrado15, .Quadrado16, .Quadrado17, .Quadrado18"
    ).forEach(quadrado => {
        const idQuadrado = quadrado.dataset.dia + '-' + quadrado.dataset.periodo;

        if (estadoQuadrados[idQuadrado] === 'selecionado') {
            // Atualiza visualmente o quadrado
            quadrado.style.backgroundColor = "#90d81d"; // Verde para "confirmado"
            estadoQuadrados[idQuadrado] = 'confirmado';

            // Limpa o conteúdo do quadrado e adiciona texto de "confirmado"
            quadrado.innerHTML = '';
            let textoConfirmado = document.createElement("div");
            textoConfirmado.className = "confirmado";
            textoConfirmado.textContent = "confirmado";
            quadrado.appendChild(textoConfirmado);

            // Adiciona o quadrado confirmado ao array para envio
            quadradosConfirmados.push({
                dia: quadrado.getAttribute('data-dia'),
                periodo: quadrado.getAttribute('data-periodo')
            });
        }
    });

    // Enviar os dados dos quadrados confirmados para o backend usando Fetch
    if (quadradosConfirmados.length > 0) {
        fetch('/confirmar_reserva', { // Alterar a URL para '/confirmar_reserva'
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quadrados: quadradosConfirmados }), // Mantenha o nome 'quadrados'
        })
        .then(response => response.json()) // Converta para JSON
        .then(data => {
            console.log(data); // Para verificar a resposta
            if (data.status === 'success') {
                alert('Reserva confirmada com sucesso!');
            } else {
                alert('Erro ao confirmar reserva: ' + data.message); // Mostre a mensagem de erro
            }
        })
        .catch(error => console.error('Erro:', error));
    }
});

// Botão de cancelamento
document.querySelector(".BotaoCancelar").addEventListener("click", function () {
    document.querySelectorAll(
        ".Quadrado1, .Quadrado2, .Quadrado3, .Quadrado4, .Quadrado5, .Quadrado6, .Quadrado7, .Quadrado8, .Quadrado9, .Quadrado10, .Quadrado11, .Quadrado12, .Quadrado13, .Quadrado14, .Quadrado15, .Quadrado16, .Quadrado17, .Quadrado18"
    ).forEach(quadrado => {
        const idQuadrado = quadrado.dataset.dia + '-' + quadrado.dataset.periodo;

        if (estadoQuadrados[idQuadrado] === 'confirmado') {
            quadrado.style.backgroundColor = "#ffffff"; // Retorna ao branco original
            quadrado.innerHTML = ''; // Remove qualquer texto
            estadoQuadrados[idQuadrado] = null; // Resetar estado
        }
    });
});

// Função para lidar com o upload de imagem do usuário
const userCircle = document.getElementById('userCircle');
const uploadInput = document.getElementById('upload');

// Quando clicar no círculo, abre o input de upload
userCircle.addEventListener('click', () => {
    uploadInput.click();
});

// Quando o usuário seleciona uma imagem, ela será carregada no círculo
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        // Quando a leitura do arquivo for concluída
        reader.onload = function(e) {
            userCircle.style.backgroundImage = `url(${e.target.result})`;
            userCircle.style.backgroundSize = 'cover';
            userCircle.style.backgroundPosition = 'center';
        };

        // Ler o arquivo selecionado como URL
        reader.readAsDataURL(file);
    }
});

// Função para carregar reservas salvas ao mudar de semana
function carregarReservasSalvas(dataInicial) {
    const semana = formatarSemana(dataInicial); // Função fictícia para obter a semana
    fetch(`/buscar_reservas?semana=${semana}`)
        .then(response => response.json())
        .then(data => {
            // Atualize o estado dos quadrados com base nas reservas salvas
            data.quadrados.forEach(quadrado => {
                const idQuadrado = quadrado.dia + '-' + quadrado.periodo;
                const elemento = document.querySelector(`[data-dia="${quadrado.dia}"][data-periodo="${quadrado.periodo}"]`);
                
                if (elemento) {
                    elemento.style.backgroundColor = "#90d81d"; // Cor verde
                    estadoQuadrados[idQuadrado] = 'confirmado'; // Marca como confirmado
                }
            });
        })
        .catch(error => console.error('Erro ao carregar reservas:', error));
}

