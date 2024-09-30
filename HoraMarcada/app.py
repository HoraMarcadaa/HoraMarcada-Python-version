from flask import Flask, render_template, request, redirect, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False  
app.secret_key = 'chave_secreta'

# Configuração do banco de dados (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sistema.db?timeout=20'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)

# Modelo da tabela 'usuarios'
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    selecoes = db.relationship('SelecaoPeriodo', backref='usuario', lazy=True)

# Modelo da tabela 'selecao_periodo'
class SelecaoPeriodo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    dia = db.Column(db.String(20), nullable=False)
    periodo = db.Column(db.String(10), nullable=False)

# Criar o banco de dados
with app.app_context():
    db.create_all()

@app.route('/selecoes')
def listar_selecoes():
    selecoes = SelecaoPeriodo.query.all()
    return render_template('selecoes.html', selecoes=selecoes)

@app.route('/usuarios')
def listar_usuarios():
    usuarios = Usuario.query.all()
    return render_template('usuarios.html', usuarios=usuarios)

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'nome' in request.form:  # Se o campo 'nome' existir, é um cadastro
            return cadastro()
        else:  # Senão, é um login
            return login()

    return render_template('index.html')

def cadastro():
    nome = request.form['nome']
    email = request.form['email']
    senha = request.form['senha']
    hashed_senha = generate_password_hash(senha, method='pbkdf2:sha256', salt_length=8)

    novo_usuario = Usuario(nome=nome, email=email, senha=hashed_senha)
    try:
        db.session.add(novo_usuario)
        db.session.commit()
        flash('Cadastro realizado com sucesso!')
        return redirect('/')
    except:
        db.session.rollback()
        flash('Erro: E-mail já cadastrado.')
        return redirect('/')
    finally:
        db.session.close()  # Fecha a sessão após a transação


def login():
    email = request.form['email']
    senha = request.form['senha']
    usuario = Usuario.query.filter_by(email=email).first()

    if usuario and check_password_hash(usuario.senha, senha):
        flash('Login realizado com sucesso!')
        return redirect('/home')  # Redireciona para a página home após login bem-sucedido
    else:
        flash('Erro: E-mail ou senha incorretos.')
        return redirect('/')
    

@app.route('/confirmar_reserva', methods=['POST'])
def confirmar_reserva():
    dados = request.json
    
    if dados is None:
        return jsonify({'status': 'error', 'message': 'JSON inválido ou ausente'}), 400

    usuario_id = 1

    try:
        with db.session.begin():  # Inicia um contexto de transação explícito
            for item in dados.get('quadrados', []):
                dia = item['dia']
                periodo = item['periodo']
                
                nova_selecao = SelecaoPeriodo(usuario_id=usuario_id, dia=dia, periodo=periodo)
                db.session.add(nova_selecao)

        return {'status': 'success'}, 200
    except Exception as e:
        db.session.rollback()
        print(f'Erro ao confirmar reserva: {e}')
        return {'status': 'error', 'message': str(e)}, 500
    finally:
        db.session.close()


# Nova rota para buscar reservas
@app.route('/buscar_reservas')
def buscar_reservas():
    reservas = db.session.query(SelecaoPeriodo).all()

    # Formatar as reservas em JSON para o frontend
    reservas_json = [{'dia': reserva.dia, 'periodo': reserva.periodo} for reserva in reservas]
    
    return jsonify({'quadrados': reservas_json})

if __name__ == '__main__':
    app.run(debug=False)

