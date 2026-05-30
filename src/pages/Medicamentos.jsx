import React, { useEffect, useState } from 'react';
import { Edit2, Loader2, PackagePlus, Search, Save, Trash2, X } from 'lucide-react';
import { createMedicamento, deleteMedicamento, getMedicamentos, updateMedicamento } from '../services/medicamentoService';

const initialForm = { nombre: '', descripcion: '', stock: 0, precio: 0 };
const money = (value) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);

const Medicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setMedicamentos(await getMedicamentos());
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (medicamento = null) => {
    setEditing(medicamento);
    setForm(medicamento ? {
      nombre: medicamento.nombre,
      descripcion: medicamento.descripcion || '',
      stock: medicamento.stock,
      precio: medicamento.precio,
    } : initialForm);
    setOpen(true);
  };

  const closeModal = () => { setOpen(false); setEditing(null); };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editing) await updateMedicamento(editing.id_medicamento, form);
      else await createMedicamento(form);
      closeModal();
      load();
    } catch (error) {
      alert(error.message);
    }
  };

  const remove = async (medicamento) => {
    if (!window.confirm(`¿Eliminar ${medicamento.nombre}?`)) return;
    try {
      await deleteMedicamento(medicamento.id_medicamento);
      load();
    } catch (error) {
      alert(error.message);
    }
  };

  const filtered = medicamentos.filter((med) =>
    med.nombre.toLowerCase().includes(search.toLowerCase()) ||
    med.descripcion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Inventario de Medicamentos</h1>
          <p>Administra existencias y precios en quetzales.</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}><PackagePlus size={18} /> Nuevo Medicamento</button>
      </header>

      <section className="table-controls glass">
        <div className="search-box"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar medicamento..." /></div>
      </section>

      <div className="table-responsive glass">
        {loading ? <div className="loading-state"><Loader2 className="animate-spin" size={32} /><p>Cargando inventario...</p></div> : (
          <table className="data-table">
            <thead><tr><th>ID</th><th>Medicamento</th><th>Descripción</th><th>Stock</th><th>Precio</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map((med) => <tr key={med.id_medicamento}>
                <td>{med.id_medicamento}</td><td className="font-semibold">{med.nombre}</td><td>{med.descripcion || '-'}</td>
                <td><span className={`stock ${med.stock <= 10 ? 'low' : ''}`}>{med.stock}</span></td><td>{money(med.precio)}</td>
                <td><div className="actions-cell"><button className="btn-ghost edit" onClick={() => openModal(med)}><Edit2 size={16} /></button><button className="btn-ghost delete" onClick={() => remove(med)}><Trash2 size={16} /></button></div></td>
              </tr>)}
              {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay medicamentos registrados.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {open && <div className="modal-overlay"><div className="modal-content glass">
        <header className="modal-header"><h2>{editing ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h2><button className="btn-close" onClick={closeModal}><X size={20} /></button></header>
        <form className="modal-form" onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group full-width"><label>Nombre</label><input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="form-group full-width"><label>Descripción</label><input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
            <div className="form-group"><label>Stock disponible</label><input type="number" min="0" step="1" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div className="form-group"><label>Precio (Q)</label><input type="number" min="0" step="0.01" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></div>
          </div>
          <footer className="modal-footer"><button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button><button className="btn-primary"><Save size={18} /> Guardar</button></footer>
        </form>
      </div></div>}
      <style>{`.stock{font-weight:700;color:#166534}.stock.low{color:#b91c1c}.table-controls{padding:1rem}.search-box{display:flex;gap:.75rem;align-items:center}.search-box input{width:100%;border:0;background:transparent;outline:0}.loading-state{padding:3rem;text-align:center}.animate-spin{animation:spin 1s linear infinite}.modal-overlay{position:fixed;inset:0;background:#0008;display:flex;align-items:center;justify-content:center;z-index:1000}.modal-content{width:min(600px,calc(100% - 2rem));background:white}.modal-header,.modal-form{padding:1.5rem}.modal-header{display:flex;justify-content:space-between;border-bottom:1px solid var(--border)}.btn-close{background:none}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.form-group{display:flex;flex-direction:column;gap:.4rem}.full-width{grid-column:span 2}.form-group input{padding:.75rem;border:1px solid var(--border);border-radius:8px;background:white;color:var(--text-main)}.modal-footer{display:flex;justify-content:flex-end;gap:1rem;margin-top:1.5rem}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Medicamentos;
