import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    fetchPuntosRecoleccion();
  }, []);

  const fetchPuntosRecoleccion = async () => {
    try {
      const response = await axios.get(ENDPOINT);
      setPuntosRecoleccion(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error al cargar los datos. Asegúrate de que json-server esté ejecutándose en el puerto 3000');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPoint) {
        // Update existing point
        await axios.put(`${ENDPOINT}/${editingPoint.id}`, formData);
        alert('Punto de recolección actualizado exitosamente');
      } else {
        // Create new point
        const newId = puntosRecoleccion.length > 0 
          ? Math.max(...puntosRecoleccion.map(p => p.id)) + 1 
          : 1;
        await axios.post(ENDPOINT, { ...formData, id: newId });
        alert('Punto de recolección creado exitosamente');
      }

      resetForm();
      fetchPuntosRecoleccion();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error al guardar los datos');
    }
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
    setFormData({ ...point });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este punto de recolección?')) {
      try {
        await axios.delete(`${ENDPOINT}/${id}`);
        alert('Punto de recolección eliminado exitosamente');
        fetchPuntosRecoleccion();
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Error al eliminar el punto de recolección');
      }
    }
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
    setShowForm(!showForm);
    setEditingPoint(null);
    setFormData({
      id: '',
      tipo: '',
      direccion: '',
      estado: '',
      observaciones: ''
    });
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const getFilteredPoints = () => {
    if (filter === 'todos') {
      return puntosRecoleccion;
    }
    return puntosRecoleccion.filter(point => point.tipo === filter || point.estado === filter);
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

        {showForm && (
          <div className="form-container">
            <h2>{editingPoint ? 'Editar Punto de Recolección' : 'Nuevo Punto de Recolección'}</h2>
            <form onSubmit={handleSubmit} className="punto-form">
              <div className="form-group">
                <label htmlFor="tipo">Tipo:</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="crítico">Crítico</option>
                  <option value="reciclaje">Reciclaje</option>
                  <option value="especial">Especial</option>
                  <option value="contenedor">Contenedor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="direccion">Dirección:</label>
                <textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Ingrese la dirección completa en Quito"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado:</label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Activo">Activo</option>
                  <option value="Dañado">Dañado</option>
                  <option value="Retirado">Retirado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">Observaciones:</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Observaciones adicionales"
                  required
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-success">
                  {editingPoint ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

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
                      {point.tipo.charAt(0).toUpperCase() + point.tipo.slice(1)}
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
    </div>
  );
};

export default AdministracionPuntos;