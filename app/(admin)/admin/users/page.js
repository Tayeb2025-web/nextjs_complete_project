"use client";
import styles from "./AdminUsers.module.css";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalForm, setModalForm] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [page , setPage] = useState(1);
  const [totalUsers , setTotalUsers] = useState(0);
  const totalPages = Math.ceil(totalUsers/5);


  const getUser = async (search) => {
    try {
      const res = await fetch(`/api/admin/users?search=${search}&page=${page}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotalUsers(data.total)
      }
    } catch (error) {
      toast.error("خطا در گرفتن اطلاعات کاربر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser(search);
  }, [search , page]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = (user) => {
    setModalForm({
      name: user.name,
      phone: user.phone || "",
      email: user.email,
      role: user.role,
      id: user._id,
    });
    setIsModalOpen(true);
  };

  const editHandler = async (id) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modalForm),
      });
      const data = await res.json();

      if (data.success) {
        const updatedUser = data.user;
        toast.success("edit good");
        setUsers((users) =>
          users.map((user) =>
            user._id === id ? { ...user, ...updatedUser } : user,
          ),
        );
        closeModal(true);
      } else {
        toast.error("خطا در تغییرات");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>مدیریت کاربران</h1>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="جستجو در نام، شماره یا ایمیل..."
          className={styles.searchInput}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {users.length === 0 ? (
        <p className={styles.empty}>هیچ کاربری یافت نشد.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>نام</th>
                <th>شماره موبایل</th>
                <th>ایمیل</th>
                <th>نقش</th>
                <th>تأیید شده</th>
                <th>تاریخ ثبت‌نام</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || "-"}</td>
                  <td>{user.phone || "-"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        user.role === "admin" ? styles.published : styles.draft
                      }`}
                    >
                      {user.role === "admin" ? "ادمین" : "کاربر عادی"}
                    </span>
                  </td>
                  <td>{user.isVerified ? "بله" : "خیر"}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className={styles.actions}>
                    <button
                      onClick={() => openModal(user)}
                      className={styles.editBtn}
                    >
                      ویرایش اطلاعات
                    </button>

                    {/* بقیه دکمه‌ها مثل تغییر نقش، بن، حذف */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>ویرایش اطلاعات کاربر</h2>
              <button onClick={closeModal} className={styles.modalClose}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>نام</label>
                <input
                  type="text"
                  value={modalForm.name}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, name: e.target.value })
                  }
                />
              </div>

              <div className={styles.field}>
                <label>ایمیل</label>
                <input
                  type="email"
                  value={modalForm.email}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, email: e.target.value })
                  }
                />
              </div>

              <div className={styles.field}>
                <label>شماره موبایل</label>
                <input
                  type="text"
                  disabled
                  value={modalForm.phone}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, phone: e.target.value })
                  }
                />
              </div>

              <div className={styles.field}>
                <label>نقش</label>
                <select
                  value={modalForm.role}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, role: e.target.value })
                  }
                >
                  <option value="user">کاربر عادی</option>
                  <option value="admin">ادمین</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={styles.cancelBtn}>
                لغو
              </button>
              <button
                onClick={() => editHandler(modalForm.id)}
                className={styles.submitBtn}
              >
                ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.pagination}>
        <button onClick={()=>setPage((page)=>page-1)} disabled={page==1}>قبلی</button>
        <span>صفحه {page} از {totalPages}</span>
        <button onClick={()=>setPage((page)=>page+1)} disabled={page==totalPages}>بعدی</button>
      </div>
    </div>
  );
}
