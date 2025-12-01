import { db } from './firebase'; 
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from "firebase/firestore";
import React, { useState } from 'react';
import { Home, LogOut, Settings, Calendar, User } from 'lucide-react';

export default function BancoSangueApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodType: '',
    phone: ''
  });
  const [userData, setUserData] = useState({
    id: null, 
    name: '',
    email: '',
    phone: '',
    bloodType: '',
    bio: ''
  });
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    bloodType: 'O+',
    notes: ''
  });
  const [appointments, setAppointments] = useState([]);
// === Funções de Usuário (Users) ===
// 1. Busca um usuário por email (para verificar se já existe no cadastro)
const getUserByEmail = async (email) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Retorna os dados do primeiro usuário encontrado
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  }
  return null;
};

// 2. Busca um usuário por email e senha (para Login)
const loginUser = async (email, password) => {
  const usersRef = collection(db, "users");
  // Busca por email E senha
  const q = query(
    usersRef, 
    where("email", "==", email), 
    where("password", "==", password)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  }
  return null;
};

// 3. Salva um novo usuário (Cadastro)
const registerUser = async (newUser) => {
  const docRef = await addDoc(collection(db, "users"), newUser);
  return docRef.id;
};


// === Funções de Agendamento (Appointments) ===

// 4. Carrega todos os agendamentos de um usuário
const getUserAppointments = async (userEmail) => {
  const appointmentsRef = collection(db, "appointments");
  // Busca agendamentos vinculados ao email
  const q = query(appointmentsRef, where("userEmail", "==", userEmail));
  const querySnapshot = await getDocs(q);

  // Retorna os dados como um array
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// 5. Salva um novo agendamento
const saveNewAppointment = async (appointment) => {
  const docRef = await addDoc(collection(db, "appointments"), appointment);
  return docRef.id;
};
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
  return emailRegex.test(email);
};
  const handleLogin = async () => { 
    if (!loginData.email || !loginData.password) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      const user = await loginUser(loginData.email, loginData.password);

      if (user) {
        setUserData(user); 
        setIsLoggedIn(true);
        
        const userApts = await getUserAppointments(user.email);
        setAppointments(userApts);

        setCurrentPage('welcome');
        alert('Login realizado com sucesso!');
      } else {
        alert('Email ou senha incorretos!');
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert('Erro ao tentar fazer login. Tente novamente.');
    }
  };

  const handleRegister = async () => { 
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword || !registerData.bloodType) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }
    
    if (!isValidEmail(registerData.email)) {
        alert('Por favor, insira um endereço de e-mail válido.');
        return;
    }

    try {
      const emailExists = await getUserByEmail(registerData.email);
      if (emailExists) {
        alert('Este e-mail já está cadastrado.');
        return;
      }

      const newUser = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password, 
        bloodType: registerData.bloodType,
        phone: registerData.phone || 'Não informado',
        active: 'true' 
      };
      await registerUser(newUser);

      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '', bloodType: '', phone: '' });
      setCurrentPage('login');
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert('Erro ao realizar o cadastro. Tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
    setLoginData({ email: '', password: '' });
    alert('Logout realizado com sucesso!');
  };


  const handleSaveProfile = async () => { 
    if (!userData.id) {
        alert('Erro: ID do usuário não encontrado. Faça login novamente.');
        return;
    }

    const userDocRef = doc(db, "users", userData.id);

    try {
        await updateDoc(userDocRef, {
            name: userData.name,
            phone: userData.phone,
            bloodType: userData.bloodType,
            bio: userData.bio
        });
        alert('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        alert('Erro ao atualizar perfil! Tente novamente.');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%)',
      padding: '1rem',
      position: 'relative'
    },
    containerHome: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
      padding: '1rem'
    },
    card: {
      backgroundColor: '#fef3c7',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '3rem',
      maxWidth: '28rem',
      width: '100%',
      position: 'relative'
    },
    cardDark: {
      backgroundColor: '#2d2d2d',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      padding: '3rem',
      maxWidth: '28rem',
      width: '100%',
      position: 'relative',
      color: '#ffffff'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#ffffff',
      marginBottom: '2rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    },
    titleDark: {
      fontSize: '3rem',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#7f1d1d',
      marginBottom: '1rem',
      lineHeight: '1.2'
    },
    subtitle: {
      textAlign: 'center',
      color: '#991b1b',
      fontSize: '0.875rem',
      marginBottom: '2rem',
      letterSpacing: '0.05em'
    },
    button: {
      width: '100%',
      backgroundColor: 'transparent',
      border: '2px solid #7f1d1d',
      color: '#7f1d1d',
      padding: '0.75rem',
      borderRadius: '9999px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem'
    },
    buttonFilled: {
      width: '100%',
      backgroundColor: '#7f1d1d',
      border: 'none',
      color: '#fef3c7',
      padding: '0.75rem',
      borderRadius: '9999px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem',
      marginTop: '1.5rem'
    },
    buttonRed: {
      width: '100%',
      backgroundColor: '#dc2626',
      border: 'none',
      color: '#ffffff',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
      marginTop: '1rem',
      textTransform: 'uppercase'
    },
    buttonPurple: {
      width: '100%',
      backgroundColor: 'transparent',
      border: '2px solid #8b5cf6',
      color: '#8b5cf6',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
      marginTop: '1rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '9999px',
      border: '2px solid #7f1d1d',
      backgroundColor: '#fef3c7',
      outline: 'none',
      fontSize: '1rem'
    },
    inputDark: {
      width: '100%',
      display: 'block',
      boxSizing: 'border-box',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: '#1f1f1f',
      outline: 'none',
      fontSize: '1rem',
      color: '#ffffff',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: '#1f1f1f',
      outline: 'none',
      fontSize: '1rem',
      color: '#ffffff',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    label: {
      display: 'block',
      color: '#7f1d1d',
      marginBottom: '0.5rem',
      fontWeight: '500'
    },
    labelDark: {
      display: 'block',
      color: '#ffffff',
      marginBottom: '0.5rem',
      fontWeight: '500',
      fontSize: '0.875rem'
    },
    inputGroup: {
      marginBottom: '1rem'
    },
    homeButton: {
      position: 'absolute',
      top: '2rem',
      left: '2rem',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#7f1d1d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      color: '#ffffff'
    },
    logoutButton: {
      position: 'absolute',
      top: '2rem',
      right: '2rem',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#7f1d1d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      color: '#ffffff',
      flexDirection: 'column',
      fontSize: '0.6rem',
      padding: '0.5rem'
    },
    backButton: {
      marginBottom: '1.5rem',
      color: '#7f1d1d',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    emoji: {
      fontSize: '4rem',
      textAlign: 'center',
      margin: '1rem 0'
    },
    linkText: {
      textAlign: 'center',
      marginTop: '1rem',
      color: '#7f1d1d',
      fontSize: '0.875rem'
    },
    link: {
      textDecoration: 'underline',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      color: '#7f1d1d',
      fontSize: '0.875rem'
    },
    hospitalCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#1f1f1f',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem'
    },
    hospitalImage: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#4a5568',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem'
    },
    statusIndicators: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    statusDot: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem'
    },
    legend: {
      backgroundColor: '#1f1f1f',
      padding: '1rem',
      borderRadius: '0.5rem',
      fontSize: '0.75rem',
      lineHeight: '1.6'
    },
    appointmentCard: {
      backgroundColor: '#1f1f1f',
      padding: '1rem',
      borderRadius: '0.75rem',
      marginBottom: '1rem',
      border: '2px solid #3f3f3f'
    },
    appointmentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #3f3f3f'
    },
    appointmentDate: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#dc2626'
    },
    appointmentStatus: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    appointmentInfo: {
      fontSize: '0.875rem',
      lineHeight: '1.6',
      color: '#d1d5db'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 1rem',
      color: '#9ca3af'
    }
  };

  // Página Inicial (Login/Registro)
  if (!isLoggedIn && currentPage === 'home') {
    return (
      <div style={styles.containerHome}>
        <div style={styles.card}>
          <div>
            <p style={styles.subtitle}>VIDA CONECTA</p>
            <h1 style={styles.titleDark}>
              BANCO DE<br />SANGUE
            </h1>
            <div style={styles.emoji}>🩸</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => setCurrentPage('login')}
              style={styles.button}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#7f1d1d';
                e.target.style.color = '#fef3c7';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#7f1d1d';
              }}
            >
              Login
            </button>
            
            <button
              onClick={() => setCurrentPage('register')}
              style={styles.button}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#7f1d1d';
                e.target.style.color = '#fef3c7';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#7f1d1d';
              }}
            >
              Registrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Página de Login
  if (!isLoggedIn && currentPage === 'login') {
    return (
      <div style={styles.containerHome}>
        <div style={styles.card}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentPage('home')}
          >
            ← Voltar
          </button>
          
          <h2 style={styles.titleDark}>Login</h2>
          <p style={styles.subtitle}>Banco de Sangue</p>
          
          <div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                style={styles.input}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Senha</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                style={styles.input}
              />
            </div>
            
            <button onClick={handleLogin} style={styles.buttonFilled}>
              Entrar
            </button>
          </div>
          
          <div style={styles.linkText}>
            Não tem conta?{' '}
            <button onClick={() => setCurrentPage('register')} style={styles.link}>
              Registre-se
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Página de Registro
  if (!isLoggedIn && currentPage === 'register') {
    return (
      <div style={styles.container}>
        <button style={styles.homeButton} onClick={() => setCurrentPage('home')}>
          <Home size={28} />
        </button>
        
        <div style={styles.cardDark}>
          <h2 style={styles.title}>Registrar</h2>
          
          <div>
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Nome Completo</label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                style={styles.inputDark}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Telefone</label>
              <input
                type="tel"
                value={registerData.phone}
                onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                style={styles.inputDark}
                placeholder="(85) 99999-9999"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Tipo Sanguíneo</label>
              <select
                value={registerData.bloodType}
                onChange={(e) => setRegisterData({...registerData, bloodType: e.target.value})}
                style={styles.inputDark}
              >
                <option value="">Selecione seu tipo sanguíneo</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>E-mail</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                style={styles.inputDark}
                placeholder="seu@email.com"
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Senha</label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                style={styles.inputDark}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Confirmar Senha</label>
              <input
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                style={styles.inputDark}
                placeholder="Digite a senha novamente"
              />
            </div>
            
            <button onClick={handleRegister} style={styles.buttonRed}>
              Criar Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Página de Boas-vindas
  if (isLoggedIn && currentPage === 'welcome') {
    return (
      <div style={styles.container}>
        <button style={styles.homeButton} onClick={() => setCurrentPage('welcome')}>
          <Home size={28} />
        </button>
        
        <button style={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={24} />
          <span>LOGOUT</span>
        </button>
        
        <div style={styles.cardDark}>
          <h2 style={styles.title}>Bem Vindo<br />[{userData.name.split(' ')[0].toUpperCase()}]</h2>
          
          <button onClick={() => setCurrentPage('profile')} style={styles.buttonPurple}>
            Meu Perfil
          </button>
          
          <button onClick={() => setCurrentPage('schedule')} style={styles.buttonRed}>
            Agende uma visita!
          </button>

          <button onClick={() => setCurrentPage('appointments-list')} style={{...styles.buttonPurple, marginTop: '0.5rem'}}>
            Minhas Doações
          </button>
          
          <button onClick={() => setCurrentPage('settings')} style={{...styles.buttonPurple, marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
            <Settings size={20} />
            Configurações
          </button>
        </div>
      </div>
    );
  }

  // Página de Agendamento
  if (isLoggedIn && currentPage === 'schedule') {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    // Simulação de estoque (em uma aplicação real, viria do backend)
    const bloodStock = {
      'A+': 1600,   // Verde
      'A-': 300,    // Vermelho
      'B+': 800,    // Amarelo
      'B-': 150,    // Preto
      'AB+': 1200,  // Amarelo
      'AB-': 450,   // Vermelho
      'O+': 2000,   // Verde
      'O-': 100     // Preto
    };
    
    const getStockColor = (quantity) => {
      if (quantity >= 1500) return '#10b981'; // Verde
      if (quantity >= 500) return '#eab308';   // Amarelo
      if (quantity >= 200) return '#f97316';   // Vermelho
      return '#6b7280';                        // Preto/Cinza
    };
    
    return (
      <div style={styles.container}>
        <button style={styles.homeButton} onClick={() => setCurrentPage('welcome')}>
          <Home size={28} />
        </button>
        
        <button style={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={24} />
          <span>LOGOUT</span>
        </button>
        
        <div style={styles.cardDark}>
          <h2 style={styles.title}>Agendar Visita</h2>
          
          <div style={styles.hospitalCard}>
            <div style={styles.hospitalImage}>🏥</div>
            <div style={{flex: 1}}>
              <div style={{fontSize: '0.75rem', fontWeight: '600'}}>
                HOSPITAL SÃO MATEUS - R JOAQUIM LIMA, 699
              </div>
              <div style={styles.statusIndicators}>
                {bloodTypes.map(type => {
                  const quantity = bloodStock[type];
                  const color = getStockColor(quantity);
                  return (
                    <div 
                      key={type}
                      style={{
                        ...styles.statusDot, 
                        backgroundColor: color,
                        fontWeight: 'bold',
                        fontSize: '0.65rem'
                      }}
                      title={`${type}: ${quantity} bolsas`}
                    >
                      {type}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <button onClick={() => setCurrentPage('appointment')} style={styles.buttonRed}>
            Agendar visita
          </button>
          
          <div style={styles.legend}>
            <div style={{fontWeight: 'bold', marginBottom: '0.5rem', color: '#ffffff'}}>LEGENDA:</div>
            <div><span style={{color: '#10b981'}}>● VERDE</span> - 1500+ BOLSAS ALTO</div>
            <div><span style={{color: '#eab308'}}>● AMARELO</span> - 500-1500 BOLSAS MÉDIO</div>
            <div><span style={{color: '#f97316'}}>● VERMELHO</span> - 200-500 BOLSAS BAIXO</div>
            <div><span style={{color: '#6b7280'}}>● PRETO</span> - &lt;200 BOLSAS ESCASSO/SEM BOLSAS</div>
          </div>
        </div>
      </div>
    );
  }


  if (isLoggedIn && currentPage === 'appointment') {

  const handleSubmitAppointment = async (e) => { 
    e.preventDefault(); 

    if (!appointmentData.date || !appointmentData.time || !appointmentData.bloodType) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newAppointment = {
      date: appointmentData.date,
      time: appointmentData.time,
      hospital: appointmentData.hospital || 'Hemocentro Principal',
      notes: appointmentData.notes,
      userEmail: userData.email, 
      disponivel: 'true' ,
      bloodType: appointmentData.bloodType || userData.bloodType || ''
    };

    try {
      await saveNewAppointment(newAppointment);

      alert('Agendamento de doação realizado com sucesso!');
      
      const updatedApts = await getUserAppointments(userData.email);
      setAppointments(updatedApts);
      
      setCurrentPage('welcome');
      setAppointmentData({ date: '', time: '', bloodType: userData.bloodType, notes: '' });

    } catch (error) {
      console.error("Erro ao agendar:", error);
      alert('Erro ao agendar a doação. Tente novamente.');
    }
  };

    return (
      <div style={styles.container}>
        <button style={styles.homeButton} onClick={() => setCurrentPage('schedule')}>
          ← Voltar
        </button>
        
        <button style={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={24} />
          <span>LOGOUT</span>
        </button>
        
        <div style={styles.cardDark}>
          <h2 style={styles.title}>Formulário de Agendamento</h2>
          
          <div>
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Data da Doação</label>
              <input
                type="date"
                value={appointmentData.date}
                onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                style={styles.inputDark}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Horário</label>
              <select
                value={appointmentData.time}
                onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                style={styles.inputDark}
              >
                <option value="">Selecione um horário</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
              </select>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Tipo Sanguíneo</label>
              <input
                type="text"
                value={userData.bloodType}
                style={styles.inputDark}
                disabled
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Hospital</label>
              <input
                type="text"
                value="Hospital São Mateus - R Joaquim Lima, 699"
                style={styles.inputDark}
                disabled
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Observações (opcional)</label>
              <textarea
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                style={styles.textarea}
                placeholder="Alguma observação importante? (Ex: primeira doação, alergias, etc.)"
              />
            </div>
            
            <button onClick={handleSubmitAppointment} style={styles.buttonRed}>
              Confirmar Agendamento
            </button>
            
            <button 
              onClick={() => setCurrentPage('schedule')} 
              style={{...styles.buttonPurple, marginTop: '0.5rem'}}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Página de Perfil
  if (isLoggedIn && currentPage === 'profile') {
    return (
      <div style={styles.container}>
        <button style={styles.homeButton} onClick={() => setCurrentPage('welcome')}>
          <Home size={28} />
        </button>
        
        <button style={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={24} />
          <span>LOGOUT</span>
        </button>
        
        <div style={styles.cardDark}>
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
            <div style={{width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#ffffff'}}>
              <User size={40} />
            </div>
          </div>
          
          <h2 style={styles.title}>Perfil</h2>
          
          <div>
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Nome</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                style={styles.inputDark}
              />
            </div>    
          <div style={styles.inputGroup}>
            <label style={styles.labelDark}>Email</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              style={styles.inputDark}
              disabled 
            />
          </div>
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Telefone</label>
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
                style={styles.inputDark}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Tipo Sanguíneo</label>
              <select
                value={userData.bloodType}
                onChange={(e) => setUserData({...userData, bloodType: e.target.value})}
                style={styles.inputDark}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.labelDark}>Texto do seu parágrafo</label>
              <textarea
                value={userData.bio}
                onChange={(e) => setUserData({...userData, bio: e.target.value})}
                style={styles.textarea}
                placeholder="Conte um pouco sobre você..."
              />
            </div>
            
            <button onClick={handleSaveProfile} style={styles.buttonRed}>
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Página de Lista de Agendamentos
  if (isLoggedIn && currentPage === 'appointments-list') {
    const formatDate = (dateString) => {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    };

    const sortedAppointments = [...appointments].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    return (
      <div style={styles.container}>
        <button style={styles.homeButton} onClick={() => setCurrentPage('welcome')}>
          <Home size={28} />
        </button>
        
        <button style={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={24} />
          <span>LOGOUT</span>
        </button>
        
        <div style={styles.cardDark}>
          <h2 style={styles.title}>Minhas Doações</h2>
          
          {sortedAppointments.length === 0 ? (
            <div style={styles.emptyState}>
              <Calendar size={64} style={{margin: '0 auto 1rem'}} />
              <p style={{fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.5rem'}}>
                Nenhuma doação agendada
              </p>
              <p style={{fontSize: '0.875rem'}}>
                Clique no botão abaixo para agendar sua primeira doação!
              </p>
              <button 
                onClick={() => setCurrentPage('schedule')} 
                style={{...styles.buttonRed, marginTop: '1.5rem'}}
              >
                Agendar Doação
              </button>
            </div>
          ) : (
            <div>
              <div style={{marginBottom: '1rem', color: '#9ca3af', fontSize: '0.875rem'}}>
                Total de doações agendadas: {sortedAppointments.length}
              </div>
              
              {sortedAppointments.map((apt) => (
                <div key={apt.id} style={styles.appointmentCard}>
                  <div style={styles.appointmentHeader}>
                    <div style={styles.appointmentDate}>
                      📅 {formatDate(apt.date)} às {apt.time}
                    </div>
                    <div style={styles.appointmentStatus}>
                      {apt.status}
                    </div>
                  </div>
                  
                  <div style={styles.appointmentInfo}>
                    <div style={{marginBottom: '0.25rem'}}>
                      <strong>🩸 Tipo Sanguíneo:</strong> {apt.bloodType || userData.bloodType || '—'}
                    </div>
                    <div style={{marginBottom: '0.25rem'}}>
                      <strong>🏥 Hospital:</strong> {apt.hospital}
                    </div>
                    {apt.notes && (
                      <div style={{marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #3f3f3f'}}>
                        <strong>📝 Observações:</strong> {apt.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => setCurrentPage('schedule')} 
                style={{...styles.buttonRed, marginTop: '1rem'}}
              >
                Agendar Nova Doação
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  // Página de Configurações
  if (isLoggedIn && currentPage === 'settings') {
    return (
      <div style={styles.container}>
        <button style={styles.homeButton} onClick={() => setCurrentPage('welcome')}>
          <Home size={28} />
        </button>
        
        <button style={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={24} />
          <span>LOGOUT</span>
        </button>
        
        <div style={styles.cardDark}>
          <h2 style={styles.title}>Configurações</h2>
          
          <div style={{textAlign: 'center', padding: '2rem', color: '#9ca3af'}}>
            <Settings size={64} style={{margin: '0 auto 1rem'}} />
            <p>Página de configurações em desenvolvimento...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}