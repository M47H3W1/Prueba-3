import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import FormularioPunto from './FormularioPunto';
import './AdministracionPuntos.css';

// Variable global para el endpoint
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
  
  // Estados para el modal
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

  // Función para mostrar modal
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

  // Función para cerrar modal
  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Validaciones básicas
  const validateFormData = (data) => {
    if (!data.tipo.trim()) {
      showModal('Validación', 'El tipo es requerido', 'warning');
      return false;
    }
    if (!data.direccion.trim()) {
      showModal('Validación', 'La dirección es requerida', 'warning');
      return false;
    }
    if (!data.estado.trim()) {
      showModal('Validación', 'El estado es requerido', 'warning');
      return false;
    }
    if (!data.observaciones.trim()) {
      showModal('Validación', 'Las observaciones son requeridas', 'warning');
      return false;
    }
    return true;
  };

  const fetchPuntosRecoleccion = () => {
    console.log('🔄 Cargando puntos de recolección...');
    
    axios.get(ENDPOINT)
      .then(response => {
        // Normalizar los IDs a string y filtrar puntos válidos
        const normalizedPoints = response.data.map(point => ({
          ...point,
          id: String(point.id) // Convertir ID a string para consistencia
        }));

        // Filtrar puntos que tienen todos los campos requeridos
        const validPoints = normalizedPoints.filter(point => 
          point.id && point.tipo && point.direccion && point.estado && point.observaciones
        );
        
        setPuntosRecoleccion(validPoints);
        console.log('✅ Puntos cargados:', validPoints.length);
        console.log('📊 Puntos válidos de', response.data.length, 'totales');
        console.table(validPoints);
        
        // Alertar si hay puntos incompletos
        if (validPoints.length !== response.data.length) {
          const invalidCount = response.data.length - validPoints.length;
          console.warn('⚠️ Se omitieron', invalidCount, 'puntos con datos incompletos');
        }
      })
      .catch(error => {
        console.error('❌ Error al cargar:', error.message);
        showModal(
          'Error de Conexión',
          'No se pudieron cargar los datos. Verifica que json-server esté ejecutándose.',
          'error'
        );
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('📝 Campo:', name, '→', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📝 Enviando formulario...');

    // Validación básica
    if (!validateFormData(formData)) {
      return;
    }

    if (editingPoint) {
      // Actualizar punto existente
      console.log('🔄 Actualizando punto ID:', editingPoint.id);
      
      axios.put(`${ENDPOINT}/${editingPoint.id}`, formData)
        .then(() => {
          console.log('✅ Punto actualizado exitosamente');
          showModal('Éxito', 'Punto de recolección actualizado correctamente', 'success');
          resetForm();
          fetchPuntosRecoleccion();
        })
        .catch(error => {
          console.error('❌ Error al actualizar:', error.message);
          if (error.response?.status === 404) {
            showModal('Error', 'El punto de recolección ya no existe. Se actualizará la lista.', 'error');
            fetchPuntosRecoleccion();
          } else {
            showModal('Error', 'No se pudo actualizar el punto de recolección', 'error');
          }
        });
    } else {
      // Crear nuevo punto
      const existingIds = puntosRecoleccion.map(p => parseInt(p.id)).filter(id => !isNaN(id));
      const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      
      const newPoint = { ...formData, id: newId.toString() };
      console.log('🔄 Creando nuevo punto ID:', newId);
      
      axios.post(ENDPOINT, newPoint)
        .then(() => {
          console.log('✅ Punto creado exitosamente');
          showModal('Éxito', 'Nuevo punto de recolección creado correctamente', 'success');
          resetForm();
          fetchPuntosRecoleccion();
        })
        .catch(error => {
          console.error('❌ Error al crear:', error.message);
          showModal('Error', 'No se pudo crear el punto de recolección', 'error');
        });
    }
  };

  const handleEdit = (point) => {
    console.log('📝 Editando punto:', point.id);
    
    // Verificar que el punto existe antes de editarlo
    if (!point.id) {
      showModal('Error', 'No se puede editar un punto sin ID válido', 'error');
      return;
    }
    
    setEditingPoint(point);
    setFormData({ ...point });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    // Verificar que el ID existe
    if (!id) {
      showModal('Error', 'No se puede eliminar un punto sin ID válido', 'error');
      return;
    }

    // Convertir el ID a string para comparación consistente
    const idString = String(id);
    const pointToDelete = puntosRecoleccion.find(point => String(point.id) === idString);
    
    console.log('🗑️ Solicitando eliminar ID:', idString);
    console.log('📋 Punto encontrado:', pointToDelete);
    
    // Verificar que el punto existe en la lista actual
    if (!pointToDelete) {
      console.warn('⚠️ Punto no encontrado en lista local para ID:', idString);
      showModal('Error', 'El punto de recolección no existe en la lista actual', 'error');
      fetchPuntosRecoleccion(); // Refrescar la lista
      return;
    }
    
    showModal(
      'Confirmar Eliminación',
      `¿Eliminar el punto de recolección ID ${idString}?\n\nDirección: ${pointToDelete.direccion}`,
      'confirm',
      () => {
        console.log('🔄 Eliminando punto ID:', idString);
        
        axios.delete(`${ENDPOINT}/${idString}`)
          .then(() => {
            console.log('✅ Punto eliminado exitosamente');
            showModal('Éxito', 'Punto de recolección eliminado correctamente', 'success');
            fetchPuntosRecoleccion();
          })
          .catch(error => {
            console.error('❌ Error al eliminar:', error.message);
            console.error('📋 Status:', error.response?.status);
            console.error('📋 Response:', error.response?.data);
            
            if (error.response?.status === 404) {
              showModal(
                'Punto No Encontrado', 
                `El punto con ID ${idString} ya no existe en el servidor. Se actualizará la lista.`, 
                'warning'
              );
              fetchPuntosRecoleccion();
            } else {
              showModal('Error', 'No se pudo eliminar el punto de recolección', 'error');
            }
          });
        closeModal();
      },
      true
    );
  };

  const resetForm = () => {
    console.log('🔄 Reiniciando formulario');
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
    console.log('🔄 Formulario:', newShowForm ? 'Mostrar' : 'Ocultar');
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
    const newFilter = e.target.value;
    console.log('🔍 Filtro:', newFilter);
    setFilter(newFilter);
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
            {showForm ? 'Cancelar' : 'Nuevo Punto de Recolección'}
          </button>

          <div className="filter-section">
            <label htmlFor="filter">Filtrar por:</label>
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

        {/* Componente de Formulario Reutilizable */}
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
            <p className="no-data">No hay puntos de recolección para mostrar</p>
          ) : (
            <div className="points-grid">
              {filteredPoints.map(point => (
                <div key={point.id} className="point-card">
                  <div className="point-header">
                    <span className={`tipo-badge ${getTipoClass(point.tipo)}`}>
                      {point.tipo ? point.tipo.charAt(0).toUpperCase() + point.tipo.slice(1) : 'Sin tipo'}
                    </span>
                    <span className={`estado-badge ${getEstadoClass(point.estado)}`}>
                      {point.estado || 'Sin estado'}
                    </span>
                  </div>
                  
                  <div className="point-content">
                    <h3>ID: {point.id || 'Sin ID'}</h3>
                    <p><strong>Dirección:</strong> {point.direccion || 'Sin dirección'}</p>
                    <p><strong>Observaciones:</strong> {point.observaciones || 'Sin observaciones'}</p>
                  </div>
                  
                  <div className="point-actions">
                    <button 
                      className="btn btn-edit" 
                      onClick={() => handleEdit(point)}
                      disabled={!point.id}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-delete" 
                      onClick={() => handleDelete(point.id)}
                      disabled={!point.id}
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

      {/* Modal Component */}
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