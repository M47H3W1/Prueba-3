import React, { useRef, useEffect } from 'react';
import './FormularioPunto.css';

const FormularioPunto = ({ 
  isVisible, 
  formData, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  isEditing 
}) => {
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      // Desplazar a la parte superior y enfocar cuando el formulario se hace visible
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Enfocar el primer campo después de un pequeño delay
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
          console.log('✅ Formulario enfocado en el primer campo');
        }
      }, 300);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📝 Enviando formulario...');
    console.log('📊 Datos del formulario:', formData);
    console.log('🔄 Modo:', isEditing ? 'Edición' : 'Creación');
    onSubmit(e);
  };

  return (
    <div className="form-container">
      <h2>
        {isEditing ? 'Editar Punto de Recolección' : 'Nuevo Punto de Recolección'}
      </h2>
      
      <form onSubmit={handleSubmit} className="punto-form">
        <div className="form-group">
          <label htmlFor="tipo">Tipo:</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={onInputChange}
            ref={firstInputRef}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
            placeholder="Observaciones adicionales"
            required
          />
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn btn-success">
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioPunto;