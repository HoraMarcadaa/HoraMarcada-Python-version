CREATE DATABASE sistema;
USE sistema;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);


CREATE TABLE Salas (
    ID_Sala INT PRIMARY KEY AUTO_INCREMENT,
    Nome_Sala VARCHAR(100),
    Capacidade INT
);

INSERT INTO Salas (Nome_Sala, Capacidade)
VALUES 
('Lab 1 informática', 80),
('Lab 2 informática', 50),
('Lab 3 informática', 50),
('Lab 4 informática', 50),
('Lab 5 informática', 50),
('Lab 6 informática', 50);


CREATE TABLE Reservas (
    ID_Reserva INT PRIMARY KEY AUTO_INCREMENT,
    Nome_Usuario VARCHAR(100) NOT NULL,
    ID_Sala INT,
    Data_Reserva DATE NOT NULL,
    Hora_Inicio TIME NOT NULL,
    Hora_Fim TIME NOT NULL,
    ID_Usuario INT,
    FOREIGN KEY (ID_Sala) REFERENCES Salas(ID_Sala),
    FOREIGN KEY (ID_Usuario) REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
