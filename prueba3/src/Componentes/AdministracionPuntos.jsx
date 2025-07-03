import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import FormularioPunto from './FormularioPunto';
import './AdministracionPuntos.css';

const ENDpunto = 'http://localhost:3000/puntosRecoleccion';

const AdministracionPuntos = () => {
  const [puntosRecoleccion, setPuntosRecoleccion] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingpunto, setEditingpunto] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    tipo: '',
    direccion: '',
    estado: '',
    observaciones: ''
  });
  const [filter, setFilter] = useState('todos');
  
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: false
  });

  useEffect(() => {
    fetchPuntosRecoleccion();
  }, []);

  const showModal = (title, message, type = 'info', onConfirm = null, showCancel = false) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setModal(prev => ({ ...prev, isOpen: false }))),
      showCancel
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const validateFormData = (data) => {
    return data.tipo && data.direccion && data.estado;
  };

  const fetchPuntosRecoleccion = () => {
    axios.get(ENDpunto)
      .then(response => {
        setPuntosRecoleccion(response.data);
      })
      .catch(error => {
        showModal('Error', 'Error al cargar los datos', 'error');
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateFormData(formData)) {
      showModal('Error', 'Los campos Tipo, Dirección y Estado son requeridos', 'warning');
      return;
    }

    if (editingpunto) {
      // Actualizar - mantener el ID como string
      const updateData = { 
        ...formData, 
        id: editingpunto.id,
        observaciones: formData.observaciones || '' // Asegurar que sea string vacío si no hay valor
      };
      
      axios.put(`${ENDpunto}/${editingpunto.id}`, updateData)
        .then(() => {
          showModal('Éxito', 'Punto actualizado correctamente', 'success');
          resetForm();
          fetchPuntosRecoleccion();
        })
        .catch(error => {
          showModal('Error', 'Error al actualizar', 'error');
        });
    } else {
      // Crear nuevo - convertir IDs existentes a números para calcular el máximo
      const existingIds = puntosRecoleccion.map(p => parseInt(p.id)).filter(id => !isNaN(id));
      const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      
      // Crear el nuevo punto con ID como STRING y observaciones opcional
      const newpunto = { 
        ...formData, 
        id: newId.toString(),
        observaciones: formData.observaciones || '' // Asegurar que sea string vacío si no hay valor
      };
      
      axios.post(ENDpunto, newpunto)
        .then(() => {
          showModal('Éxito', 'Punto creado correctamente', 'success');
          resetForm();
          fetchPuntosRecoleccion();
        })
        .catch(error => {
          showModal('Error', 'Error al crear', 'error');
        });
    }
  };

  const handleEdit = (punto) => {
    setEditingpunto(punto);
    setFormData({ ...punto });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    showModal(
      'Confirmar',
      `¿Eliminar el punto ID ${id}?`,
      'confirm',
      () => {
        axios.delete(`${ENDpunto}/${id}`)
          .then(() => {
            showModal('Éxito', 'Punto eliminado correctamente', 'success');
            fetchPuntosRecoleccion();
          })
          .catch(error => {
            showModal('Error', 'Error al eliminar', 'error');
          });
        closeModal();
      },
      true
    );
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingpunto(null);
    setFormData({
      id: '',
      tipo: '',
      direccion: '',
      estado: '',
      observaciones: ''
    });
  };

  const toggleForm = () => {
    const newShowForm = !showForm;
    setShowForm(newShowForm);
    
    if (!newShowForm) {
      setEditingpunto(null);
      setFormData({
        id: '',
        tipo: '',
        direccion: '',
        estado: '',
        observaciones: ''
      });
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const getFilteredpuntos = () => {
    if (filter === 'todos') {
      return puntosRecoleccion;
    }
    return puntosRecoleccion.filter(punto => 
      punto.tipo === filter || punto.estado === filter
    );
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Activo': return 'estado-activo';
      case 'Dañado': return 'estado-danado';
      case 'Retirado': return 'estado-retirado';
      default: return '';
    }
  };

  const getTipoClass = (tipo) => {
    switch (tipo) {
      case 'crítico': return 'tipo-critico';
      case 'reciclaje': return 'tipo-reciclaje';
      case 'especial': return 'tipo-especial';
      case 'contenedor': return 'tipo-contenedor';
      default: return '';
    }
  };

  const filteredpuntos = getFilteredpuntos();

  return (
    <div className="administracion-container">
      <header className="admin-header">
        <h1>Sistema de Gestión de Puntos de Recolección</h1>
        <p>Administración de contenedores de basura en Quito</p>
      </header>

      <div className="admin-content">
        <div className="controls">
          <button 
            className="btn btn-primary" 
            onClick={toggleForm}
          >
            {showForm ? 'Cancelar' : 'Nuevo Punto'}
          </button>

          <div className="filter-section">
            <label htmlFor="filter">Filtrar:</label>
            <select 
              id="filter" 
              value={filter} 
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="crítico">Crítico</option>
              <option value="reciclaje">Reciclaje</option>
              <option value="especial">Especial</option>
              <option value="contenedor">Contenedor</option>
              <option value="Activo">Activos</option>
              <option value="Dañado">Dañados</option>
              <option value="Retirado">Retirados</option>
            </select>
          </div>
        </div>

        <FormularioPunto
          isVisible={showForm}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isEditing={!!editingpunto}
        />

        <div className="puntos-container">
          <h2>Puntos de Recolección ({filteredpuntos.length})</h2>
          
          {filteredpuntos.length === 0 ? (
            <p className="no-data">No hay puntos para mostrar</p>
          ) : (
            <div className="puntos-grid">
              {filteredpuntos.map(punto => (
                <div key={punto.id} className="punto-card">
                  <div className="punto-header">
                    <span className={`tipo-badge ${getTipoClass(punto.tipo)}`}>
                      {punto.tipo}
                    </span>
                    <span className={`estado-badge ${getEstadoClass(punto.estado)}`}>
                      {punto.estado}
                    </span>
                  </div>
                  
                  <div className="punto-content">
                    <h3>ID: {punto.id}</h3>
                    <p><strong>Dirección:</strong> {punto.direccion}</p>
                    <p><strong>Observaciones:</strong> {punto.observaciones}</p>
                  </div>
                  
                  <div className="punto-actions">
                    <button 
                      className="btn btn-edit" 
                      onClick={() => handleEdit(punto)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-delete" 
                      onClick={() => handleDelete(punto.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
        showCancel={modal.showCancel}
      />
    </div>
  );
};

export default AdministracionPuntos;