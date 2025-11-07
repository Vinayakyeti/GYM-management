import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  console.log('Auth state changed:', user?.email);
});

window.toggleAuthMode = (portal) => {
  const loginSection = document.getElementById('loginSection');
  const registerSection = document.getElementById('registerSection');
  
  if (loginSection.style.display === 'none') {
    loginSection.style.display = 'block';
    registerSection.style.display = 'none';
  } else {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
  }
};

window.adminRegister = async () => {
  const email = document.getElementById('adminRegEmail').value;
  const password = document.getElementById('adminRegPassword').value;
  const name = document.getElementById('adminName').value;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: name,
      email: email,
      role: 'admin',
      createdAt: new Date()
    });
    alert('Admin registered successfully! Please login.');
    toggleAuthMode('admin');
    console.log('Admin registered');
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
};

window.memberRegister = async () => {
  const email = document.getElementById('memberRegEmail').value;
  const password = document.getElementById('memberRegPassword').value;
  const name = document.getElementById('memberName').value;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: name,
      email: email,
      role: 'member',
      createdAt: new Date()
    });
    alert('Member registered successfully! Please login.');
    toggleAuthMode('member');
    console.log('Member registered');
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
};

window.userRegister = async () => {
  const email = document.getElementById('userRegEmail').value;
  const password = document.getElementById('userRegPassword').value;
  const name = document.getElementById('userName').value;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: name,
      email: email,
      role: 'user',
      createdAt: new Date()
    });
    alert('User registered successfully! Please login.');
    toggleAuthMode('user');
    console.log('User registered');
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
};

window.adminLogin = async () => {
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadMembers();
    loadBills();
    console.log('Admin logged in');
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
};

window.memberLogin = async () => {
  const email = document.getElementById('memberEmail').value;
  const password = document.getElementById('memberPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('memberPanel').style.display = 'block';
    loadMemberBills();
    loadMemberNotifications();
    console.log('Member logged in');
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
};

window.userLogin = async () => {
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('userPanel').style.display = 'block';
    loadUserDetails();
    console.log('User logged in');
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
};

window.logout = async () => {
  await signOut(auth);
  location.reload();
  console.log('Logged out');
};

window.showTab = (tabName) => {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  if (tabName === 'members') {
    document.getElementById('membersTab').style.display = 'block';
    event.target.classList.add('active');
  } else if (tabName === 'bills') {
    document.getElementById('billsTab').style.display = 'block';
    event.target.classList.add('active');
  } else if (tabName === 'notifications') {
    document.getElementById('notificationsTab').style.display = 'block';
    event.target.classList.add('active');
  } else if (tabName === 'receipts') {
    document.getElementById('receiptsTab').style.display = 'block';
    event.target.classList.add('active');
  } else if (tabName === 'alerts') {
    document.getElementById('alertsTab').style.display = 'block';
    event.target.classList.add('active');
  }
};

window.addMember = async () => {
  const member = {
    name: document.getElementById('memberName').value,
    age: document.getElementById('memberAge').value,
    mobile: document.getElementById('memberMobile').value,
    plan: document.getElementById('memberPlan').value,
    startDate: document.getElementById('memberStartDate').value,
    createdAt: new Date()
  };
  
  await addDoc(collection(db, 'members'), member);
  alert('Member added successfully');
  loadMembers();
  console.log('Member added:', member.name);
};

async function loadMembers() {
  const querySnapshot = await getDocs(collection(db, 'members'));
  const list = document.getElementById('membersList');
  const billSelect = document.getElementById('billMember');
  const notifySelect = document.getElementById('notifyMember');
  
  list.innerHTML = '';
  billSelect.innerHTML = '<option value="">Select Member</option>';
  notifySelect.innerHTML = '<option value="">Select Member</option>';
  
  querySnapshot.forEach((doc) => {
    const member = doc.data();
    list.innerHTML += `
      <div class="member-item">
        <strong>${member.name}</strong> - Age: ${member.age}, Mobile: ${member.mobile}
        <br>Plan: ${member.plan}, Start: ${member.startDate}
        <div class="item-actions">
          <button class="btn-delete" onclick="deleteMember('${doc.id}')">Delete</button>
        </div>
      </div>
    `;
    
    billSelect.innerHTML += `<option value="${doc.id}">${member.name}</option>`;
    notifySelect.innerHTML += `<option value="${doc.id}">${member.name}</option>`;
  });
}

window.deleteMember = async (id) => {
  if (confirm('Delete this member?')) {
    await deleteDoc(doc(db, 'members', id));
    loadMembers();
    console.log('Member deleted:', id);
  }
};

window.createBill = async () => {
  const bill = {
    memberId: document.getElementById('billMember').value,
    amount: document.getElementById('billAmount').value,
    date: document.getElementById('billDate').value,
    createdAt: new Date()
  };
  
  await addDoc(collection(db, 'bills'), bill);
  alert('Bill created successfully');
  loadBills();
  console.log('Bill created:', bill.amount);
};

async function loadBills() {
  const querySnapshot = await getDocs(collection(db, 'bills'));
  const list = document.getElementById('billsList');
  list.innerHTML = '';
  
  querySnapshot.forEach((doc) => {
    const bill = doc.data();
    list.innerHTML += `
      <div class="bill-item">
        Amount: $${bill.amount} - Date: ${bill.date}
        <div class="item-actions">
          <button class="btn-delete" onclick="deleteBill('${doc.id}')">Delete</button>
        </div>
      </div>
    `;
  });
}

window.deleteBill = async (id) => {
  if (confirm('Delete this bill?')) {
    await deleteDoc(doc(db, 'bills', id));
    loadBills();
    console.log('Bill deleted:', id);
  }
};

window.sendNotification = async () => {
  const notification = {
    memberId: document.getElementById('notifyMember').value,
    message: document.getElementById('notifyMessage').value,
    createdAt: new Date()
  };
  
  await addDoc(collection(db, 'notifications'), notification);
  alert('Notification sent successfully');
  console.log('Notification sent');
};

async function loadMemberBills() {
  const querySnapshot = await getDocs(collection(db, 'bills'));
  const list = document.getElementById('memberBills');
  list.innerHTML = '';
  
  querySnapshot.forEach((doc) => {
    const bill = doc.data();
    list.innerHTML += `
      <div class="bill-item">
        Amount: $${bill.amount} - Date: ${bill.date}
      </div>
    `;
  });
}

async function loadMemberNotifications() {
  const querySnapshot = await getDocs(collection(db, 'notifications'));
  const list = document.getElementById('memberNotifications');
  list.innerHTML = '';
  
  querySnapshot.forEach((doc) => {
    const notif = doc.data();
    list.innerHTML += `
      <div class="notification-item">
        ${notif.message}
      </div>
    `;
  });
}

async function loadUserDetails() {
  const querySnapshot = await getDocs(collection(db, 'members'));
  const details = document.getElementById('userDetails');
  
  querySnapshot.forEach((doc) => {
    const member = doc.data();
    details.innerHTML = `
      <div class="member-item">
        <strong>${member.name}</strong><br>
        Age: ${member.age}<br>
        Mobile: ${member.mobile}<br>
        Plan: ${member.plan}<br>
        Start Date: ${member.startDate}
      </div>
    `;
  });
}

window.searchRecords = async () => {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const querySnapshot = await getDocs(collection(db, 'members'));
  const results = document.getElementById('searchResults');
  results.innerHTML = '';
  
  querySnapshot.forEach((doc) => {
    const member = doc.data();
    if (member.name.toLowerCase().includes(searchTerm) || member.mobile.includes(searchTerm)) {
      results.innerHTML += `
        <div class="member-item">
          <strong>${member.name}</strong> - ${member.mobile}
        </div>
      `;
    }
  });
  console.log('Search completed:', searchTerm);
};

window.exportReport = async () => {
  const membersSnapshot = await getDocs(collection(db, 'members'));
  let csv = 'Name,Age,Mobile,Plan,Start Date\n';
  
  membersSnapshot.forEach((doc) => {
    const m = doc.data();
    csv += `${m.name},${m.age},${m.mobile},${m.plan},${m.startDate}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gym-report.csv';
  a.click();
  console.log('Report exported');
};
