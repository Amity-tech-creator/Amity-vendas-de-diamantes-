import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

/**
 * Converte uma string para hash SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica se a senha digitada corresponde ao hash no Firestore
 */
export async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
  try {
    const inputHash = await hashPassword(inputPassword);
    const adminDoc = await getDoc(doc(db, 'config', 'admin'));
    
    if (!adminDoc.exists()) {
      console.warn('Admin config not found in Firestore. Initializing default...');
      await initializeAdminPassword('8710'); // Inicializa se não existir
      return inputPassword === '8710';
    }

    const { passwordHash } = adminDoc.data();
    const isMatch = inputHash === passwordHash;

    // Log de tentativa
    await logAdminAttempt(isMatch);

    return isMatch;
  } catch (error) {
    console.error('Erro na verificação admin:', error);
    return false;
  }
}

/**
 * Inicializa ou altera a senha admin no banco de dados
 */
export async function initializeAdminPassword(newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  await setDoc(doc(db, 'config', 'admin'), {
    passwordHash,
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid || 'system'
  });
}

/**
 * Registra logs de tentativas (Segurança)
 */
async function logAdminAttempt(success: boolean) {
  try {
    await addDoc(collection(db, 'admin_logs'), {
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      success,
      type: 'PASSWORD_VERIFICATION'
    });
  } catch (e) {
    console.error('Falha ao registrar log:', e);
  }
}
