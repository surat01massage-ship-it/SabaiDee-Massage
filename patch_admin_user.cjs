const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr1 = `  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', phone: '', password: '', role: 'Customer' });`;

const replacement1 = `  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', phone: '', password: '', role: 'Customer' });`;

const targetStr2 = `  // User Management
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userForm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      onShowToast(\`เพิ่มผู้ใช้งาน \${userForm.name} สำเร็จ\`, "success");
      setShowUserForm(false);
      setUserForm({ name: '', phone: '', password: '', role: 'Customer' });
      fetchAllUsers();
      if (userForm.role === 'Staff') fetchStaffList();
    } catch (e: any) {
      onShowToast(e.message, "error");
    }
  };`;

const replacement2 = `  // User Management
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingUserId;
      const url = isEdit ? \`/api/users/\${editingUserId}\` : '/api/auth/register';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userForm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      onShowToast(isEdit ? \`อัปเดตข้อมูล \${userForm.name} สำเร็จ\` : \`เพิ่มผู้ใช้งาน \${userForm.name} สำเร็จ\`, "success");
      setShowUserForm(false);
      setEditingUserId(null);
      setUserForm({ name: '', phone: '', password: '', role: 'Customer' });
      fetchAllUsers();
      if (userForm.role === 'Staff') fetchStaffList();
    } catch (e: any) {
      onShowToast(e.message, "error");
    }
  };
  
  const handleEditUser = (user: User) => {
    setEditingUserId(user.UserID);
    setUserForm({ name: user.Name, phone: user.Phone, password: user.PasswordHash || '', role: user.Role });
    setShowUserForm(true);
  };`;

const targetStr3 = `            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              + เพิ่มผู้ใช้งานใหม่
            </button>`;

const replacement3 = `            <button
              onClick={() => {
                setEditingUserId(null);
                setUserForm({ name: '', phone: '', password: '', role: 'Customer' });
                setShowUserForm(!showUserForm);
              }}
              className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              + เพิ่มผู้ใช้งานใหม่
            </button>`;

const targetStr4 = `              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowUserForm(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl">บันทึกข้อมูล</button>
              </div>`;

const replacement4 = `              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowUserForm(false); setEditingUserId(null); }} className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl">บันทึกข้อมูล</button>
              </div>`;

const targetStr5 = `                  <th className="py-3 px-2">วันที่สมัคร</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {allUsers.filter(u => userFilter === 'All' || u.Role === userFilter).map((user) => (
                  <tr key={user.UserID} className="hover:bg-slate-50/50">`;

const replacement5 = `                  <th className="py-3 px-2">วันที่สมัคร</th>
                  <th className="py-3 px-2 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {allUsers.filter(u => userFilter === 'All' || u.Role === userFilter).map((user) => (
                  <tr key={user.UserID} className="hover:bg-slate-50/50">`;

const targetStr6 = `                    <td className="py-4 px-2 text-slate-400">
                      {new Date(user.CreatedDate).toLocaleDateString('th-TH')}
                    </td>
                  </tr>`;

const replacement6 = `                    <td className="py-4 px-2 text-slate-400">
                      {new Date(user.CreatedDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <button onClick={() => handleEditUser(user)} className="text-sky-500 hover:text-sky-600 text-xs font-bold underline cursor-pointer">แก้ไข</button>
                    </td>
                  </tr>`;


content = content.replace(targetStr1, replacement1);
content = content.replace(targetStr2, replacement2);
content = content.replace(targetStr3, replacement3);
content = content.replace(targetStr4, replacement4);
content = content.replace(targetStr5, replacement5);
content = content.replace(targetStr6, replacement6);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
