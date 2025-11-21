import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Redirect helper: if shouldBeLoggedIn=true then ensure logged in else redirect to login
export function onAuthStateChangedRedirect(shouldBeLoggedIn, redirectTo){
  onAuthStateChanged(auth, user => {
    if(shouldBeLoggedIn){
      if(!user) location.replace(redirectTo);
    } else {
      if(user) location.replace(redirectTo);
    }
  });
}

export function initSignup(formSelector, errorSelector, successSelector){
  const form = document.querySelector(formSelector);
  const err = document.querySelector(errorSelector);
  const success = document.querySelector(successSelector);
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault(); err.textContent=''; success.textContent='';
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    try{
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      // optional: save to Firestore
      try{
        await setDoc(doc(db, 'users', userCred.user.uid), { name, email, createdAt: new Date().toISOString() });
      }catch(errSave){console.warn('Could not save user to Firestore', errSave)}
      success.textContent = 'Account created. Redirecting to dashboard...';
      setTimeout(()=> location.replace('/dashboard.html'), 1500);
    }catch(err){
      console.error(err); err.textContent = (err.message || 'Signup failed');
    }
  });
}

export function initLogin(formSelector, errorSelector){
  const form = document.querySelector(formSelector);
  const err = document.querySelector(errorSelector);
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault(); err.textContent='';
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    try{
      await signInWithEmailAndPassword(auth, email, password);
      location.replace('/dashboard.html');
    }catch(error){
      console.error(error); err.textContent = (error.message || 'Login failed');
    }
  });
}

export function initForgot(formSelector, errorSelector, successSelector){
  const form = document.querySelector(formSelector);
  const err = document.querySelector(errorSelector);
  const success = document.querySelector(successSelector);
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault(); err.textContent=''; success.textContent='';
    const email = form.querySelector('#email').value.trim();
    try{
      await sendPasswordResetEmail(auth, email);
      success.textContent = 'Check your email for reset instructions.';
    }catch(error){
      console.error(error); err.textContent = (error.message || 'Could not send reset email');
    }
  });
}

export function initLogout(buttonSelector){
  const btn = document.querySelector(buttonSelector);
  if(!btn) return;
  btn.addEventListener('click', async ()=>{
    try{ await signOut(auth); location.replace('/login.html'); }catch(err){console.error(err)}
  });
}