import { db } from './firebase'; 
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

const handleRegister = async () => {
   
    const newUser = { /* ... dados ... */ };
    
    try {
        const docRef = await addDoc(collection(db, "users"), newUser);
        console.log("Documento escrito com ID: ", docRef.id);
        
    } catch (e) {
        console.error("Erro ao adicionar documento: ", e);
        alert("Erro ao criar conta. Tente novamente.");
    }
};