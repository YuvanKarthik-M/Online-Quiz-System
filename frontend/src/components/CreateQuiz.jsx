import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './CreateQuiz.css';

const API_URL = 'http://localhost:5000/api';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID for edit mode
    const isEditMode = !!id;
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const [classrooms, setClassrooms] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timer, setTimer] = useState(30);
    const [isPublic, setIsPublic] = useState(true);
    const [classroomId, setClassroomId] = useState('');
    const [questions, setQuestions] = useState([
        { type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: 0, isRequired: true }
    ]);
    const [deadline, setDeadline] = useState('');
    const [showResultBeforeDeadline, setShowResultBeforeDeadline] = useState(false);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.role !== 'instructor') {
            navigate('/dashboard');
            return;
        }

        const fetchClassrooms = async () => {
            try {
                const res = await axios.get(`${API_URL}/classroom`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClassrooms(res.data);
            } catch (err) {
                console.error("Error fetching classrooms", err);
            }
        };

        const fetchQuizForEdit = async () => {
            if (!isEditMode) return;
            setFetchingData(true);
            try {
                const res = await axios.get(`${API_URL}/quiz/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const qData = res.data;
                setTitle(qData.title);
                setDescription(qData.description || '');
                setTimer(qData.timer);
                setIsPublic(qData.isPublic);
                setClassroomId(qData.classroomId || '');
                setQuestions(qData.questions || []);
                if (qData.deadline) {
                    const date = new Date(qData.deadline);
                    const formatted = date.toISOString().slice(0, 16);
                    setDeadline(formatted);
                }
                setShowResultBeforeDeadline(qData.showResultBeforeDeadline);
            } catch (err) {
                console.error("Error fetching quiz for edit:", err);
                setError(err.response?.data?.message || 'Failed to load quiz data. Check if you are authorized.');
            } finally {
                setFetchingData(false);
            }
        };

        fetchClassrooms();
        fetchQuizForEdit();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditMode]);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionTextChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        const currentOpt = newQuestions[qIndex].options[oIndex];
        if (typeof currentOpt === 'string') {
            newQuestions[qIndex].options[oIndex] = { text: value, image: '' };
        } else {
            newQuestions[qIndex].options[oIndex] = { ...currentOpt, text: value };
        }
        setQuestions(newQuestions);
    };

    const handleOptionImageUpload = (qIndex, oIndex, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const newQuestions = [...questions];
            const currentOpt = newQuestions[qIndex].options[oIndex];
            if (typeof currentOpt === 'string') {
                newQuestions[qIndex].options[oIndex] = { text: currentOpt, image: reader.result };
            } else {
                newQuestions[qIndex].options[oIndex] = { ...currentOpt, image: reader.result };
            }
            setQuestions(newQuestions);
        };
    };

    const handleQuestionImageUpload = (qIndex, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            handleQuestionChange(qIndex, 'image', reader.result);
        };
    };

    const removeQuestionImage = (qIndex) => {
        handleQuestionChange(qIndex, 'image', null);
    };

    const removeOptionImage = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        const currentOpt = newQuestions[qIndex].options[oIndex];
        if (typeof currentOpt !== 'string') {
            newQuestions[qIndex].options[oIndex] = { ...currentOpt, image: '' };
        }
        setQuestions(newQuestions);
    };

    const toggleAllRequired = (setRequired) => {
        const newQuestions = questions.map(q => ({ ...q, isRequired: setRequired }));
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: 0, isRequired: true }]);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!isPublic && !classroomId) {
            setError('Please select a classroom for restricted quiz');
            setLoading(false);
            return;
        }

        try {
            const quizData = {
                title,
                description,
                timer,
                isPublic,
                classroomId: isPublic ? null : classroomId,
                questions,
                deadline,
                showResultBeforeDeadline
            };

            if (isEditMode) {
                await axios.put(`${API_URL}/quiz/${id}`, quizData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/quiz`, quizData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save quiz');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) return (
        <div className="create-quiz-container" style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading quiz data...</p>
        </div>
    );

    return (
        <div className="create-quiz-container">
            <div style={{ marginBottom: '1.5rem' }}>
                <button type="button" onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px', cursor: 'pointer', width: 'fit-content' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back
                </button>
            </div>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>
                {isEditMode ? `Edit Quiz: ${title}` : 'Create New Quiz'}
            </h1>
            {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Quiz Title</label>
                    <input
                        type="text"
                        className="form-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter quiz title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is this quiz about?"
                        rows="3"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label">Timer (Minutes)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={timer}
                            onChange={(e) => setTimer(Number(e.target.value))}
                            min="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Privacy</label>
                        <select
                            className="form-select"
                            value={isPublic}
                            onChange={(e) => setIsPublic(e.target.value === 'true')}
                            style={{ padding: '0.9rem' }}
                        >
                            <option value="true">Public</option>
                            <option value="false">Restricted (Select Classroom)</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label">Deadline (Optional)</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <input
                            type="checkbox"
                            id="showResult"
                            disabled={!deadline}
                            checked={!deadline ? true : showResultBeforeDeadline}
                            onChange={(e) => setShowResultBeforeDeadline(e.target.checked)}
                        />
                        <label htmlFor="showResult" style={{ fontSize: '0.9rem', cursor: !deadline ? 'not-allowed' : 'pointer', opacity: !deadline ? 0.6 : 1 }}>
                            {!deadline ? "Results are always visible without a deadline" : "Show results before deadline"}
                        </label>
                    </div>
                </div>

                {!isPublic && (
                    <div className="form-group animate-fade-in">
                        <label className="form-label">Select Classroom</label>
                        <select
                            className="form-select"
                            value={classroomId}
                            onChange={(e) => setClassroomId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose a classroom --</option>
                            {classrooms.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                        {classrooms.length === 0 && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                You haven't created any classrooms yet. Create one in the dashboard first.
                            </p>
                        )}
                    </div>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '2rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        Total Questions: {questions.length}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button type="button" className="nav-btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }} onClick={() => toggleAllRequired(true)}>
                            ✓ All Required
                        </button>
                        <button type="button" className="nav-btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={() => toggleAllRequired(false)}>
                            ○ All Optional
                        </button>
                    </div>
                </div>

                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="question-card">
                        <button type="button" className="remove-question-btn" onClick={() => removeQuestion(qIndex)}>✕</button>

                        <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', gap: '1rem', paddingRight: '2.5rem' }}>
                            <label className="form-label" style={{ margin: 0, flex: 1 }}>Question {qIndex + 1}</label>

                            <select
                                className="form-select"
                                style={{ width: 'auto', padding: '0.4rem 1rem', borderRadius: '8px', flex: 1 }}
                                value={q.type || 'mcq'}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    handleQuestionChange(qIndex, 'type', newType);
                                    if (newType === 'mcq') {
                                        handleQuestionChange(qIndex, 'options', ['', '', '', '']);
                                        handleQuestionChange(qIndex, 'correctAnswer', 0);
                                    } else if (newType === 'true_false') {
                                        handleQuestionChange(qIndex, 'options', ['True', 'False']);
                                        handleQuestionChange(qIndex, 'correctAnswer', 0);
                                    } else if (newType === 'fill_in') {
                                        handleQuestionChange(qIndex, 'options', []);
                                        handleQuestionChange(qIndex, 'correctAnswer', '');
                                    }
                                }}
                            >
                                <option value="mcq">Multiple Choice</option>
                                <option value="fill_in">Fill in the Blanks</option>
                                <option value="true_false">True or False</option>
                            </select>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: q.isRequired !== false ? 'var(--secondary)' : 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <input
                                    type="checkbox"
                                    checked={q.isRequired !== false} // Defaults to true
                                    onChange={(e) => handleQuestionChange(qIndex, 'isRequired', e.target.checked)}
                                />
                                {q.isRequired !== false ? 'Required' : 'Optional'}
                            </label>
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                value={q.text}
                                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                placeholder="Enter question text"
                                required
                            />
                            {q.image && (
                                <div style={{ marginTop: '0.8rem', position: 'relative', display: 'inline-block' }}>
                                    <img src={q.image} alt="Question" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                                    <button type="button" onClick={() => removeQuestionImage(qIndex)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✕</button>
                                </div>
                            )}
                            <div style={{ marginTop: '0.8rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px dashed var(--primary)', width: 'fit-content' }}>
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleQuestionImageUpload(qIndex, e)} />
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                    Add Question Image
                                </label>
                            </div>
                        </div>

                        {(!q.type || q.type === 'mcq') && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {q.options.map((opt, oIndex) => {
                                    const optText = typeof opt === 'string' ? opt : opt.text;
                                    const optImage = typeof opt === 'string' ? '' : opt.image;
                                    return (
                                        <div key={oIndex} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correctAnswer === oIndex || String(q.correctAnswer) === String(oIndex)}
                                                    onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                                                    value={optText || ''}
                                                    onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                                                    placeholder={`Option ${oIndex + 1} text`}
                                                />
                                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', transition: 'background 0.2s', width: '40px', height: '40px' }} title="Add Image to Option">
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleOptionImageUpload(qIndex, oIndex, e)} />
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                </label>
                                            </div>
                                            {optImage && (
                                                <div style={{ position: 'relative', marginTop: '0.5rem', width: 'fit-content' }}>
                                                    <img src={optImage} alt={`Option ${oIndex + 1}`} style={{ maxHeight: '100px', borderRadius: '6px', border: '1px solid var(--glass-border)' }} />
                                                    <button type="button" onClick={() => removeOptionImage(qIndex, oIndex)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✕</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {q.type === 'true_false' && (
                            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', paddingLeft: '0.5rem' }}>
                                {['True', 'False'].map((opt, oIndex) => (
                                    <label key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}>
                                        <input
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            checked={q.correctAnswer === oIndex || String(q.correctAnswer) === String(oIndex)}
                                            onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'fill_in' && (
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label className="form-label" style={{ fontSize: '0.9rem' }}>Correct Answer</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={q.correctAnswer || ''}
                                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                    placeholder="Enter the correct answer (case-insensitive during check)"
                                    required
                                />
                            </div>
                        )}
                    </div>
                ))}

                <button type="button" className="add-btn" onClick={addQuestion}>
                    ➕ Add Another Question
                </button>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Quiz' : 'Create Quiz')}
                </button>
            </form>
        </div>
    );
};

export default CreateQuiz;
