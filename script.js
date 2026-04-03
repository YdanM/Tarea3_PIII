document.addEventListener("DOMContentLoaded", () => {
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

  // LOGIN 
  const loginBtn = document.querySelector("#loginForm .btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const usuario = usuarios.find(u => u.email === email && u.password === password);

      if (usuario) {
        localStorage.setItem("usuarioActual", JSON.stringify(usuario));
        window.location.href = "citas.html";
      } else {
        alert("Credenciales incorrectas.");
      }
    });
  }

  //  REGISTRO 
  const registerBtn = document.querySelector("#registerForm .btn");
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      const nombre = document.getElementById("registerNombre").value;
      const apellidos = document.getElementById("registerApellidos").value;
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      const confirm = document.getElementById("registerConfirmPassword").value;

      if (password !== confirm) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      if (usuarios.some(u => u.email === email)) {
        alert("Ya existe una cuenta con este correo.");
        return;
      }

      const nuevoUsuario = { nombre, apellidos, email, password };
      usuarios.push(nuevoUsuario);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      alert("Registro exitoso. Ahora inicia sesión.");
      window.location.href = "index.html";
    });
  }

  if (window.location.pathname.includes("citas.html")) {
    if (!usuarioActual) {
      window.location.href = "index.html";
      return;
    }

    document.getElementById("usuarioNombre").textContent = usuarioActual.nombre;

    const form = document.getElementById("appointmentForm");
    const tbody = document.querySelector("#tablaCitas tbody");

    // Mapas de correspondencia entre especialidades y médicos
    const especialidadToMedico = {
      "Pediatría": "Dr. Juan Pérez",
      "Cardiología": "Dra. Ana López",
      "Dermatología": "Dr. Carlos Gómez"
    };

    const medicoToEspecialidad = {
      "Dr. Juan Pérez": "Pediatría",
      "Dra. Ana López": "Cardiología",
      "Dr. Carlos Gómez": "Dermatología"
    };

    // Obtener los elementos select
    const especialidadSelect = document.getElementById('especialidad');
    const medicoSelect = document.getElementById('medico');

    especialidadSelect.addEventListener('change', () => {
      const esp = especialidadSelect.value;
      if (esp && especialidadToMedico[esp]) {
        medicoSelect.value = especialidadToMedico[esp];
      } else {
        medicoSelect.value = "";
      }
    });

    medicoSelect.addEventListener('change', () => {
      const med = medicoSelect.value;
      if (med && medicoToEspecialidad[med]) {
        especialidadSelect.value = medicoToEspecialidad[med];
      } else {
        especialidadSelect.value = "";
      }
    });

    mostrarCitas();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const especialidad = document.getElementById("especialidad").value;
      const medico = document.getElementById("medico").value;
      const fecha = document.getElementById("fecha").value;
      const hora = document.getElementById("hora").value;
      const motivo = document.getElementById("motivo").value;

      const cita = { especialidad, medico, fecha, hora, motivo };
      const key = `citas_${usuarioActual.email}`;
      const citas = JSON.parse(localStorage.getItem(key)) || [];
      
      if (form.dataset.editingIndex !== undefined) {
        // Actualizar cita existente
        const index = parseInt(form.dataset.editingIndex);
        citas[index] = cita;
        alert("Cita actualizada exitosamente");
        cancelarEdicion();
      } else {
        // Agregar nueva cita
        citas.push(cita);
        alert("Cita agendada exitosamente");
      }
      
      localStorage.setItem(key, JSON.stringify(citas));
      mostrarCitas();
      form.reset();
    });

    function mostrarCitas() {
      const key = `citas_${usuarioActual.email}`;
      const citas = JSON.parse(localStorage.getItem(key)) || [];
      tbody.innerHTML = "";
      citas.forEach((c, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${c.especialidad}</td>
          <td>${c.medico}</td>
          <td>${c.fecha}</td>
          <td>${c.hora}</td>
          <td>${c.motivo}</td>
          <td>
            <button class="btn-action btn-edit" onclick="editarCita(${index})">✏️</button>
            <button class="btn-action btn-delete" onclick="eliminarCita(${index})">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    //Eliminar cita
    window.eliminarCita = function(index) {
      if (confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
        const key = `citas_${usuarioActual.email}`;
        const citas = JSON.parse(localStorage.getItem(key)) || [];
        citas.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(citas));
        mostrarCitas();
      }
    }

    // Función para editar cita
    window.editarCita = function(index) {
      const key = `citas_${usuarioActual.email}`;
      const citas = JSON.parse(localStorage.getItem(key)) || [];
      const cita = citas[index];
      
      // Llenar el formulario con los datos de la cita
      document.getElementById("especialidad").value = cita.especialidad;
      document.getElementById("medico").value = cita.medico;
      document.getElementById("fecha").value = cita.fecha;
      document.getElementById("hora").value = cita.hora;
      document.getElementById("motivo").value = cita.motivo;
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = "Actualizar Cita";
      submitBtn.style.background = "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)";
      
      // Agregar un botón de cancelar
      let cancelBtn = document.getElementById("cancelBtn");
      if (!cancelBtn) {
        cancelBtn = document.createElement("button");
        cancelBtn.id = "cancelBtn";
        cancelBtn.type = "button";
        cancelBtn.className = "btn btn-cancel";
        cancelBtn.textContent = "Cancelar";
        cancelBtn.style.background = "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)";
        cancelBtn.style.marginTop = "10px";
        submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
      }
      
      // Guardar el índice de la cita que se está editando
      form.dataset.editingIndex = index;
      
      cancelBtn.onclick = function() {
        cancelarEdicion();
      };
      
      // Scroll hacia el formulario
      document.querySelector('.form-title').scrollIntoView({ behavior: 'smooth' });
    }

    // cancelar edición
    function cancelarEdicion() {
      form.reset();
      delete form.dataset.editingIndex;
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = "Agendar Cita";
      submitBtn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      
      const cancelBtn = document.getElementById("cancelBtn");
      if (cancelBtn) {
        cancelBtn.remove();
      }
    }
  }
});

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("usuarioActual");
  window.location.href = "index.html";
}