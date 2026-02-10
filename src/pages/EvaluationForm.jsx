import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Download, User, CheckCircle, Save, Send } from 'lucide-react';
import SignaturePad from 'signature_pad';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../App.css';
import { generateEvaluationPDF } from '../services/pdfService';
import { evaluationCriteria } from '../constants/evaluationCriteria';

export default function EvaluationForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = searchParams.get('mode') === 'create';

  const [formData, setFormData] = useState({
    id: id || Date.now().toString(),
    employeeId: '',
    employeeName: '',
    jobTitle: '',
    department: '',
    periodFrom: '',
    periodTo: '',
    ratings: {},
    status: 'DRAFT'
  });

  const [supervisorComments, setSupervisorComments] = useState('');
  const [employeeAgreement, setEmployeeAgreement] = useState('');
  const [employeeComments, setEmployeeComments] = useState('');
  const [managerDecision, setManagerDecision] = useState('');

  const [signatures, setSignatures] = useState({
    employee: null,
    supervisor: null
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (user?.role === 'evaluator') {
      const loadEmployees = async () => {
        const emps = await api.getEmployees();
        setEmployees(emps);
      };
      loadEmployees();
    }
  }, [user]);

  useEffect(() => {
    if (!isNew && id) {
      const loadData = async () => {
        const data = await api.getEvaluationById(id);
        if (data) {
          setFormData(data);
          setSupervisorComments(data.supervisorComments || '');
          setEmployeeAgreement(data.employeeAgreement || '');
          setEmployeeComments(data.employeeComments || '');
          setManagerDecision(data.managerDecision || '');
          setSignatures(data.signatures || { employee: null, supervisor: null });
        }
      };
      loadData();
    }
  }, [id, isNew]);

  const handleRatingChange = (criteriaId, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [criteriaId]: value
      }
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    evaluationCriteria.forEach(category => {
      category.subcriteria.forEach(item => {
        const rating = formData.ratings[item.id] || 0;
        const score = rating * item.multiplier;
        total += score;
      });
    });
    return total.toFixed(1);
  };

  const getItemScore = (multiplier, rating) => {
    const maxPoints = multiplier * 5;
    const currentScore = rating * multiplier;
    return { currentScore: currentScore.toFixed(1), maxPoints: maxPoints.toFixed(1) };
  };

  const getPerformanceLevel = (score) => {
    const s = parseFloat(score);
    if (s >= 90) return { text: 'Excellent / እጅግ በጣም ጥሩ', color: 'text-green-600' };
  if (s >= 70) return { text: 'Very Good / በጣም ጥሩ', color: 'text-blue-600' };
  if (s >= 50) return { text: 'Good / ጥሩ', color: 'text-indigo-600' };
  if (s >= 30) return { text: 'Low / ዝቅተኛ', color: 'text-amber-600' };
  if (s >= 20) return { text: 'Very Low / በጣም ዝቅተኛ', color: 'text-red-700' };
  return { text: 'Unsatisfactory / በቂ ያልሆነ', color: 'text-red-600' };
  };

  const generatePDF = () => {
    generateEvaluationPDF(formData);
  };

  const handleSave = async () => {
    const updatedData = {
      ...formData,
      supervisorComments,
      signatures,
      status: 'DRAFT'
    };
    await api.saveEvaluation(updatedData);
    setFormData(updatedData);
    alert('Draft saved successfully!');
  };

  const handleSubmitToEmployee = async () => {
    // alert(`Debug: Submit clicked. User: ${user ? user.id : 'None'}`); // Removed to reduce spam
    if (!formData.employeeId || !formData.jobTitle) {
      alert('Please select an Employee and fill in the Job Title.');
      return;
    }

    // Auto-save signature if canvas has content but not yet saved
    let supervisorSig = signatures.supervisor;
    if (!supervisorSig && sigPadSupervisor.current && !sigPadSupervisor.current.isEmpty()) {
      supervisorSig = sigPadSupervisor.current.toDataURL('image/png');
      setSignatures(prev => ({ ...prev, supervisor: supervisorSig }));
    }

    if (!supervisorSig) {
      alert('Please add your signature before submitting.');
      return;
    }

    if (!user) {
      alert('You must be logged in to submit.');
      return;
    }

    // Proceed with submission
    try {
      console.log('Starting submission process...');

      // First save the evaluation with all current data
      const updatedData = {
        ...formData,
        supervisorComments,
        createdBy: user.id
      };

      await api.saveEvaluation(updatedData);
      console.log('Evaluation saved successfully');

      // Then submit to employee with signature
      const result = await api.submitToEmployee(formData.id, supervisorSig);
      console.log('Submission result:', result);

      setFormData(result);
      alert('Evaluation submitted to employee successfully!');
      navigate('/evaluator-dashboard');
    } catch (error) {
      console.error('Error during submission:', error);
      alert(`Submission failed: ${error.message}`);
    }
  };

  const handleEmployeeSubmit = async () => {
    if (!employeeAgreement) {
      alert('Please select whether you agree or disagree.');
      return;
    }

    // Auto-save signature if canvas has content but not yet saved
    let employeeSig = signatures.employee;
    if (!employeeSig && sigPadEmployee.current && !sigPadEmployee.current.isEmpty()) {
      employeeSig = sigPadEmployee.current.toDataURL('image/png');
      setSignatures(prev => ({ ...prev, employee: employeeSig }));
    }

    if (!employeeSig) {
      alert('Please add your signature before submitting.');
      return;
    }

    if (window.confirm('Submit your response? This cannot be undone.')) {
      const result = await api.respondToEvaluation(
        formData.id,
        employeeAgreement,
        employeeComments,
        employeeSig
      );
      setFormData(result);
      alert('Your response has been submitted successfully!');
      navigate('/employee-dashboard');
    }
  };

  const handleFinalize = async () => {
    if (!managerDecision) {
      alert('Please provide a manager decision/recommendation.');
      return;
    }

    if (window.confirm('Finalize this evaluation? This will mark it as complete.')) {
      try {
        const result = await api.finalizeEvaluation(formData.id, managerDecision);
        setFormData(result);
        alert('Evaluation finalized successfully!');
        navigate('/evaluator-dashboard');
      } catch (error) {
        console.error('Error finalizing evaluation:', error);
        alert(`Finalization failed: ${error.message}`);
      }
    }
  };

  const sigPadEmployee = useRef(null);
  const sigPadSupervisor = useRef(null);
  const canvasRefEmployee = useRef(null);
  const canvasRefSupervisor = useRef(null);

  useEffect(() => {
    if (canvasRefSupervisor.current) {
      sigPadSupervisor.current = new SignaturePad(canvasRefSupervisor.current);
      // Handle resize if needed, or just set width/height in CSS/HTML
    }
    return () => {
      if (sigPadSupervisor.current) {
        sigPadSupervisor.current.off();
      }
    };
  }, [user?.role, formData.status, signatures.supervisor]);

  useEffect(() => {
    if (canvasRefEmployee.current) {
      sigPadEmployee.current = new SignaturePad(canvasRefEmployee.current);
    }
    return () => {
      if (sigPadEmployee.current) {
        sigPadEmployee.current.off();
      }
    };
  }, [user?.role, formData.status, signatures.employee]);

  const clearSignature = (role) => {
    if (role === 'employee') {
      if (sigPadEmployee.current) {
        sigPadEmployee.current.clear();
        setSignatures(prev => ({ ...prev, employee: null }));
      }
    } else if (role === 'supervisor') {
      if (sigPadSupervisor.current) {
        sigPadSupervisor.current.clear();
        setSignatures(prev => ({ ...prev, supervisor: null }));
      }
    }
  };

  const saveSignature = (role) => {
    if (role === 'employee') {
      if (sigPadEmployee.current && !sigPadEmployee.current.isEmpty()) {
        setSignatures(prev => ({
          ...prev,
          employee: sigPadEmployee.current.toDataURL('image/png')
        }));
      }
    } else if (role === 'supervisor') {
      if (sigPadSupervisor.current && !sigPadSupervisor.current.isEmpty()) {
        setSignatures(prev => ({
          ...prev,
          supervisor: sigPadSupervisor.current.toDataURL('image/png')
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Performance Evaluation</h1>
              <p className="opacity-90">Employee Performance Appraisal Form</p>
            </div>
            {(formData.status === 'COMPLETED' || user?.role === 'evaluator') && (
              <button
                onClick={generatePDF}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all backdrop-blur-sm"
              >
                <Download size={18} />
                Download PDF
              </button>
            )}
          </div>
        </header>

        {/* Employee Info */}
        <div className="p-8 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User className="text-indigo-600" />
            Employee Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label>
              Employee Name / የሠራተኛው ስም
              <div className="input-wrapper">
                <User size={18} />
                {formData.status === 'DRAFT' && user?.role === 'evaluator' ? (
                  <select
                    value={formData.employeeId}
                    onChange={(e) => {
                      const selectedEmp = employees.find(emp => emp.id === e.target.value);
                      setFormData({
                        ...formData,
                        employeeId: e.target.value,
                        employeeName: selectedEmp ? selectedEmp.name : ''
                      });
                    }}
                    className="w-full p-2 bg-transparent outline-none"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.employeeName}
                    readOnly
                    disabled
                  />
                )}
              </div>
            </label>
            <label>
              Job Title / የሥራ መደብ
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Developer"
                  disabled={formData.status !== 'DRAFT'}
                />
              </div>
            </label>
            <label>
              Department / የሥራ ክፍል
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Engineering"
                  disabled={formData.status !== 'DRAFT'}
                />
              </div>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label>
                Period From
                <div className="input-wrapper">
                  <input
                    type="date"
                    value={formData.periodFrom}
                    onChange={(e) => setFormData({ ...formData, periodFrom: e.target.value })}
                    disabled={formData.status !== 'DRAFT'}
                  />
                </div>
              </label>
              <label>
                Period To
                <div className="input-wrapper">
                  <input
                    type="date"
                    value={formData.periodTo}
                    onChange={(e) => setFormData({ ...formData, periodTo: e.target.value })}
                    disabled={formData.status !== 'DRAFT'}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="p-8">
          {evaluationCriteria.map((category) => (
            <article key={category.id} className="category-card">
              <div className="category-header">
                <h3>{category.name}</h3>
                <span className="weight-badge">Weight: {category.weight}</span>
              </div>
              <p className="text-slate-500 mb-6 italic">{category.nameAm}</p>

              <div className="category-body">
                {category.subcriteria.map((item) => {
                  const rating = formData.ratings[item.id] || 0;
                  const { currentScore, maxPoints } = getItemScore(item.multiplier, rating);

                  return (
                    <div key={item.id} className="criterion">
                      <div className="criterion-info">
                        <h4>{item.id.toString().replace('_', '.')}. {item.name} ({item.weight})</h4>
                        <p>{item.nameAm}</p>
                        <span className="multiplier">Multiplier: {item.multiplier}</span>
                      </div>
                      <div className="rating-panel">
                        <span className="rating-label">Rating</span>
                        <div className="rating-buttons">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => user?.role === 'evaluator' && formData.status === 'DRAFT' && handleRatingChange(item.id, r)}
                              className={`rating-button ${rating === r ? 'active' : ''} ${formData.status !== 'DRAFT' ? 'disabled' : ''}`}
                              disabled={formData.status !== 'DRAFT'}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                        <span className="points">Points: {currentScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        {/* Total Score */}
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">Total Score</h3>
            <p className="text-slate-400">Sum of all weighted scores</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-indigo-400">{calculateTotal()} <span className="text-xl text-slate-500">/ 100</span></div>
            <div className={`text-lg font-medium ${getPerformanceLevel(calculateTotal()).color.replace('text-', 'text-white ')}`}>
              {getPerformanceLevel(calculateTotal()).text}
            </div>
          </div>
        </div>

        {/* Comments & Signatures */}
        <div className="p-8 space-y-8">
          <article className="comment-card">
            <h3>Supervisor Comments / የኃላፊው አስተያየት</h3>
            <textarea
              value={supervisorComments}
              onChange={(e) => setSupervisorComments(e.target.value)}
              rows={4}
              placeholder="Enter supervisor comments and recommendations..."
              disabled={formData.status !== 'DRAFT'}
            />


          </article>

          <article className="comment-card">
            <h3>Employee Comments / የሰራተኛው አስተያየት</h3>
            <div className="mb-4">
              <p className="font-medium mb-2">Do you agree with this evaluation?</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="agreement"
                    value="agree"
                    checked={employeeAgreement === 'agree'}
                    onChange={(e) => setEmployeeAgreement(e.target.value)}
                    disabled={formData.status !== 'PENDING_EMPLOYEE' || user?.role !== 'employee'}
                  />
                  I Agree / እስማማለሁ
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="agreement"
                    value="disagree"
                    checked={employeeAgreement === 'disagree'}
                    onChange={(e) => setEmployeeAgreement(e.target.value)}
                    disabled={formData.status !== 'PENDING_EMPLOYEE' || user?.role !== 'employee'}
                  />
                  I Disagree / አልስማማም
                </label>
              </div>
            </div>
            <textarea
              value={employeeComments}
              onChange={(e) => setEmployeeComments(e.target.value)}
              rows={4}
              placeholder="Enter your comments..."
              disabled={formData.status !== 'PENDING_EMPLOYEE' || user?.role !== 'employee'}
            />
          </article>

          {(formData.status === 'PENDING_SUPERVISOR' || formData.status === 'COMPLETED') && (
            <article className="comment-card">
              <h3>Manager Decision / የመጨረሻ ውሳኔ</h3>
              <textarea
                value={managerDecision}
                onChange={(e) => setManagerDecision(e.target.value)}
                rows={4}
                placeholder="Enter final decision or recommendations..."
                disabled={formData.status !== 'PENDING_SUPERVISOR' || user?.role !== 'evaluator'}
              />
            </article>
          )}

          {/* Supervisor Signature */}
          {user?.role === 'evaluator' && formData.status === 'DRAFT' && (
            <article className="comment-card">
              <h3>Supervisor Signature / የኃላፊው ፊርማ</h3>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-white">
                {signatures.supervisor ? (
                  <div className="text-center">
                    <img src={signatures.supervisor} alt="Supervisor Signature" className="max-h-32 mx-auto border border-slate-200 rounded" />
                    <button
                      onClick={() => clearSignature('supervisor')}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 underline">
                      Clear Signature
                    </button>
                  </div>
                ) : (
                  <>
                    <canvas
                      ref={canvasRefSupervisor}
                      className="w-full h-32 border border-slate-300 rounded bg-white cursor-crosshair"
                      width={500}
                      height={128}
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => saveSignature('supervisor')}
                        className="secondary-btn text-sm">
                        Save Signature
                      </button>
                      <button
                        onClick={() => sigPadSupervisor.current?.clear()}
                        className="text-sm text-slate-600 hover:text-slate-800">
                        Clear
                      </button>
                    </div>
                  </>
                )}
              </div>
            </article>
          )}

          {/* Employee Signature */}
          {user?.role === 'employee' && formData.status === 'PENDING_EMPLOYEE' && (
            <article className="comment-card">
              <h3>Employee Signature / የሰራተኛው ፊርማ</h3>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-white">
                {signatures.employee ? (
                  <div className="text-center">
                    <img src={signatures.employee} alt="Employee Signature" className="max-h-32 mx-auto border border-slate-200 rounded" />
                    <button
                      onClick={() => clearSignature('employee')}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 underline">
                      Clear Signature
                    </button>
                  </div>
                ) : (
                  <>
                    <canvas
                      ref={canvasRefEmployee}
                      className="w-full h-32 border border-slate-300 rounded bg-white cursor-crosshair"
                      width={500}
                      height={128}
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => saveSignature('employee')}
                        className="secondary-btn text-sm">
                        Save Signature
                      </button>
                      <button
                        onClick={() => sigPadEmployee.current?.clear()}
                        className="text-sm text-slate-600 hover:text-slate-800">
                        Clear
                      </button>
                    </div>
                  </>
                )}
              </div>
            </article>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 sticky bottom-0 z-10">
          {user?.role === 'evaluator' && formData.status === 'DRAFT' && (
            <>
              <button onClick={handleSave} className="secondary-btn flex items-center gap-2">
                <Save size={18} />
                Save Draft
              </button>
              <button onClick={handleSubmitToEmployee} className="primary-btn flex items-center gap-2">
                <Send size={18} />
                Submit to Employee
              </button>
            </>
          )}

          {user?.role === 'employee' && formData.status === 'PENDING_EMPLOYEE' && (
            <button onClick={handleEmployeeSubmit} className="primary-btn flex items-center gap-2">
              <CheckCircle size={18} />
              Sign & Complete
            </button>
          )}

          {user?.role === 'evaluator' && formData.status === 'PENDING_SUPERVISOR' && (
            <button onClick={handleFinalize} className="primary-btn flex items-center gap-2">
              <CheckCircle size={18} />
              Finalize Evaluation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// Evaluation criteria moved to src/constants/evaluationCriteria.js