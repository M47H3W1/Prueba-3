import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import FormularioPunto from './FormularioPunto';
import './AdministracionPuntos.css';

const ENDPOINT = 'http://localhost:3000/puntosRecoleccion';

const AdministracionPuntos = () => {
  const [puntosRecoleccion, setPuntosRecoleccion] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
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
    return data.tipo && data.direccion && data.estado && data.observaciones;
  };

  const fetchPuntosRecoleccion = () => {
    axios.get(ENDPOINT)
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
      showModal('Error', 'Todos los campos son requeridos', 'warning');
      return;
    }

    if (editingPoint) {
      const updateData = { ...formData, id: editingPoint.id };
      
      axios.put(`${ENDPOINT}/${editingPoint.id}`, updateData)
        .then(() => {
          showModal('Éxito', 'Punto actualizado correctamente', 'success');
          resetForm();
          fetchPuntosRecoleccion();
        })
        .catch(error => {
          showModal('Error', 'Error al actualizar', 'error');
        });
    } else {
      const existingIds = puntosRecoleccion.map(p => p.id);
      const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      
      const newPoint = { ...formData, id: newId };
      
      axios.post(ENDPOINT, newPoint)
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

  const handleEdit = (point) => {
    setEditingPoint(point);
    setFormData({ ...point });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const pointToDelete = puntosRecoleccion.find(point => point.id === id);
    
    showModal(
      'Confirmar',
      `¿Eliminar el punto ID ${id}?`,
      'confirm',
      () => {
        axios.delete(`${ENDPOINT}/${id}`)
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
    setEditingPoint(null);
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
      setEditingPoint(null);
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

  const getFilteredPoints = () => {
    if (filter === 'todos') {
      return puntosRecoleccion;
    }
    return puntosRecoleccion.filter(point => 
      point.tipo === filter || point.estado === filter
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

  const filteredPoints = getFilteredPoints();

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
          isEditing={!!editingPoint}
        />

        <div className="points-container">
          <h2>Puntos de Recolección ({filteredPoints.length})</h2>
          
          {filteredPoints.length === 0 ? (
            <p className="no-data">No hay puntos para mostrar</p>
          ) : (
            <div className="points-grid">
              {filteredPoints.map(point => (
                <div key={point.id} className="point-card">
                  <div className="point-header">
                    <span className={`tipo-badge ${getTipoClass(point.tipo)}`}>
                      {point.tipo}
                    </span>
                    <span className={`estado-badge ${getEstadoClass(point.estado)}`}>
                      {point.estado}
                    </span>
                  </div>
                  
                  <div className="point-content">
                    <h3>ID: {point.id}</h3>
                    <p><strong>Dirección:</strong> {point.direccion}</p>
                    <p><strong>Observaciones:</strong> {point.observaciones}</p>
                  </div>
                  
                  <div className="point-actions">
                    <button 
                      className="btn btn-edit" 
                      onClick={() => handleEdit(point)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-delete" 
                      onClick={() => handleDelete(point.id)}
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