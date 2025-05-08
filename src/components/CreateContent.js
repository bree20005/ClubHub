import React, { useState } from 'react';

function CreateContentPage() {
  const [type, setType] = useState('post');
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isOpenEnded, setIsOpenEnded] = useState(false);
  const [submitted, setSubmitted] = useState([]);

  const handleImageChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleDelete = (indexToDelete) => {
    setSubmitted(submitted.filter((_, i) => i !== indexToDelete));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toLocaleString();

    if (type === 'post') {
      setSubmitted([
        { type: 'post', caption, image, date: timestamp },
        ...submitted,
      ]);
      setCaption('');
      setImage(null);
    } else {
      setSubmitted([
        {
          type: 'poll',
          question,
          options: isOpenEnded ? [] : options,
          open: isOpenEnded,
        },
        ...submitted,
      ]);
      setQuestion('');
      setOptions(['', '']);
      setIsOpenEnded(false);
    }
  };

  return (
    <div className="feed-container">
      <h1>Create Content</h1>

      <form onSubmit={handleSubmit} className="create-content-form">
        <label>
          What do you want to create?
          <br/>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="post">Post</option>
            <option value="poll">Poll</option>
          </select>
        </label>

        {type === 'post' && (
          <>
            <label>
              Upload Image:
              <br />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="imageUpload"
                style={{ display: 'none' }}
              />
              <label htmlFor="imageUpload" className="custom-file-upload">
                Choose File
              </label>
              <div className="file-name">
                {image ? 'File selected ✔️' : 'No file chosen'}
              </div>
            </label>

            {image && <img src={image} alt="preview" className="preview-image" />}

            <label>
              Caption:
              <br />
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </label>
          </>
        )}

        {type === 'poll' && (
          <>
            <label>
              Poll Question:
              <br />
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isOpenEnded}
                onChange={(e) => setIsOpenEnded(e.target.checked)}
              />
              Make this an open-ended poll
            </label>

            {!isOpenEnded && (
              <>
                {options.map((opt, idx) => (
                  <input
                    key={idx}
                    value={opt}
                    placeholder={`Option ${idx + 1}`}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[idx] = e.target.value;
                      setOptions(copy);
                    }}
                    style={{ marginBottom: '8px' }}
                  />
                ))}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setOptions([...options, ''])}
                  >
                    Add Option
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (options.length > 0) {
                        const updated = [...options];
                        updated.pop(); // Remove last
                        setOptions(updated);
                      }
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ff6b6b',
                      border: '1px solid #ff6b6b',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    ✕ Delete Last Option
                  </button>
                </div>
              </>
            )}
          </>
        )}

        <button type="submit">Submit for Approval</button>
      </form>

      {/* Display submitted content */}
      {submitted.map((item, index) => (
        <div key={index} className="post-card">
          {item.type === 'post' && (
            <>
              {item.image && (
                <img src={item.image} alt="uploaded" className="preview-image" />
              )}
              <p>{item.caption}</p>
              <small>{item.date}</small>
            </>
          )}
          {item.type === 'poll' && (
            <>
              <h3>{item.question}</h3>
              {item.open ? (
                <em>This poll is open-ended.</em>
              ) : (
                <>
                  <ul>
                    {item.options.map((opt, i) => (
                      <li key={i}>
                        <button>{opt}</button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleDelete(index)}
                    style={{
                      marginTop: '10px',
                      backgroundColor: 'transparent',
                      color: '#ff6b6b',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    ✕ Delete
                  </button>
                </>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default CreateContentPage;
