from flask import Flask, render_template, request, redirect, flash, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
import string
import random
import os
from dotenv import load_dotenv
from flask import session


# Carrega as variáveis de ambiente
load_dotenv()

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False
app.secret_key = os.getenv('SECRET_KEY', 'chave_secreta')

# Configuração do banco de dados (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sistema.db?timeout=20'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configuração do e-mail usando Gmail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')  # Seu e-mail
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')  # Sua senha de aplicativo do Gmail
mail = Mail(app)

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

# Rota para listar seleções
@app.route('/selecoes')
def listar_selecoes():
    selecoes = SelecaoPeriodo.query.all()
    return render_template('selecoes.html', selecoes=selecoes)

# Rota para listar usuários
@app.route('/usuarios')
def listar_usuarios():
    usuarios = Usuario.query.all()
    return render_template('usuarios.html', usuarios=usuarios)

# Rota da página inicial
@app.route('/home')
def home():
    return render_template('home.html')

# Rota principal para cadastro e login
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'nome' in request.form:  # Se o campo 'nome' existir, é um cadastro
            return cadastro()
        else:  # Senão, é um login
            return login()
    return render_template('index.html')

# Função de cadastro de usuário
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
        db.session.close()

def login():
    email = request.form['email']
    senha = request.form['senha']
    usuario = Usuario.query.filter_by(email=email).first()
    if usuario and check_password_hash(usuario.senha, senha):
        session['user_id'] = usuario.id  # Armazenando o ID do usuário na sessão
        flash('Login realizado com sucesso!')
        return redirect('/home')
    else:
        flash('Erro: E-mail ou senha incorretos.')
        return redirect('/')

@app.route('/logout')
def logout():
    session.pop('user_id', None)  # Remove o user_id da sessão
    flash('Você saiu do sistema.')
    return redirect('/')

# Função para enviar email
def enviar_email(to_email, subject, body):
    msg = Message(subject, recipients=[to_email], body=body, sender=app.config['MAIL_USERNAME'])
    mail.send(msg)

# Função para gerar senha provisória
def gerar_senha_provisoria():
    caracteres = string.ascii_letters + string.digits
    senha_provisoria = ''.join(random.choice(caracteres) for _ in range(10))
    return senha_provisoria

# Rota para recuperação de senha
@app.route('/esqueceu_senha', methods=['GET', 'POST'])
def esqueceu_senha():
    if request.method == 'POST':
        email = request.form['email']
        usuario = Usuario.query.filter_by(email=email).first()
        if usuario:
            senha_provisoria = gerar_senha_provisoria()
            usuario.senha = generate_password_hash(senha_provisoria, method='pbkdf2:sha256', salt_length=8)
            db.session.commit()

            enviar_email(usuario.email, 'Senha Provisória', 
                         f'Sua nova senha provisória é: {senha_provisoria}\n'
                         'Por favor, altere-a assim que fizer login.')
            flash('Um e-mail com a senha provisória foi enviado.')
        else:
            flash('E-mail não encontrado.')
    return render_template('esqueceu_senha.html')

# Rota para redefinição de senha
@app.route('/redefinir_senha/<token>', methods=['GET', 'POST'])
def redefinir_senha(token):
    flash('Este link para redefinir senha não será necessário, pois agora você tem uma senha provisória.')
    return redirect(url_for('esqueceu_senha'))

# Rotas para páginas de laboratórios
@app.route('/lab1')
def lab1():
    return render_template('lab.html', nome='Lab 1', descricao='Espaço amplo, comporta 120 alunos e possui 60 computadores.', capacidade=120, computadores=60)

@app.route('/lab2')
def lab2():
    return render_template('lab.html', nome='Lab 2', descricao='Funcionalidade para turmas com até 80 alunos.', capacidade=80, computadores=40)

@app.route('/lab3')
def lab3():
    return render_template('lab.html', nome='Lab 3', descricao='Laboratório compacto, com 27 computadores.', capacidade=58, computadores=27)

@app.route('/lab4')
def lab4():
    return render_template('lab.html', nome='Lab 4', descricao='Espaço versátil para até 70 alunos.', capacidade=70, computadores=35)

@app.route('/lab5')
def lab5():
    return render_template('lab.html', nome='Lab 5', descricao='Contém 35 computadores para aulas.', capacidade=70, computadores=35)

@app.route('/lab6')
def lab6():
    return render_template('lab.html', nome='Lab 6', descricao='Laboratório espaçoso com 45 computadores.', capacidade=90, computadores=45)

@app.route('/editusuario', methods=['GET', 'POST'])
def editusuario():
    usuario_id = session.get('user_id')  # Obtém o ID do usuário logado da sessão
    if not usuario_id:
        flash('Você precisa estar logado para editar o perfil.')
        return redirect(url_for('index'))  # Redireciona para a página de login (index)
    
    usuario = Usuario.query.get(usuario_id)
    
    if usuario:
        if request.method == 'POST':
            if 'nome' in request.form and 'email' in request.form and 'senha' in request.form:
                novo_nome = request.form['nome']
                novo_email = request.form['email']
                nova_senha = request.form['senha']
                
                # Verifica se o novo e-mail já está em uso por outro usuário
                usuario_com_email_existente = Usuario.query.filter_by(email=novo_email).first()
                if usuario_com_email_existente and usuario_com_email_existente.id != usuario.id:
                    flash('Esse e-mail já está em uso por outro usuário.')
                    return redirect(url_for('editusuario'))  # Redireciona para a página de edição do perfil
                
                # Atualiza as informações do usuário
                usuario.nome = novo_nome
                usuario.email = novo_email
                
                # Se a nova senha foi fornecida, atualiza a senha do usuário
                if nova_senha:
                    usuario.senha = generate_password_hash(nova_senha, method='pbkdf2:sha256', salt_length=8)
                
                try:
                    db.session.commit()  # Salva as alterações no banco de dados
                    flash('Perfil atualizado com sucesso!')
                except Exception as e:
                    db.session.rollback()  # Faz rollback em caso de erro
                    flash(f'Ocorreu um erro ao salvar as alterações: {str(e)}')

                return redirect(url_for('home'))  # Redireciona para a home após a atualização
            else:
                flash("Todos os campos são obrigatórios.")
                return redirect(url_for('editusuario'))  # Redireciona para a página de edição do perfil
        
        # Exibe o formulário de edição com os dados atuais do usuário
        return render_template('editusuario.html', usuario=usuario)
    else:
        flash('Usuário não encontrado!')
        return redirect(url_for('home'))



@app.route('/excluir_conta', methods=['POST'])
def excluir_conta():
    usuario_id = session.get('user_id')  # Obtém o ID do usuário logado da sessão
    
    if not usuario_id:
        flash('Você precisa estar logado para excluir sua conta.')
        return redirect(url_for('index'))  # Redireciona para a página de login
    
    usuario = Usuario.query.get(usuario_id)  # Busca o usuário no banco de dados
    
    if usuario:
        db.session.delete(usuario)  # Deleta o usuário
        db.session.commit()  # Confirma a exclusão no banco de dados
        session.pop('user_id', None)  # Remove o ID do usuário da sessão
        flash('Conta excluída com sucesso!')
        return redirect('/')  # Redireciona para a página inicial
    else:
        flash('Usuário não encontrado.')
        return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)
