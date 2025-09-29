// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';

// // Definisikan interface untuk payload token
// interface CustomJwtPayload {
//   userId: string;
//   role: 'user' | 'writer' | 'admin';
//   // Tambahkan properti lain yang ada di token Anda, jika ada
// }

// export function AuthRedirect() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('portal_token');
//     if (token) {
//       try {
//         const decodedToken = jwtDecode<CustomJwtPayload>(token);
//         const userRole = decodedToken.role;

//         // Redirect berdasarkan peran pengguna
//         if (userRole === 'admin') {
//           navigate('/admin');
//         } else if (userRole === 'writer') {
//           navigate('/writer');
//         } else {
//           navigate('/dashboard'); // Atau rute default
//         }

//       } catch (error) {
//         console.error("Invalid token:", error);
//         localStorage.removeItem('portal_token');
//         navigate('/login'); // Kembali ke login jika token tidak valid
//       }
//     } else {
//       navigate('/login'); // Arahkan ke login jika tidak ada token
//     }
//   }, [navigate]);

//   return <div>Loading...</div>;
// }
