import React, { useState } from 'react';                                                                                             
import axios from 'axios';                                                                                                           
                                                                                                                                     
function AudioPlayer({ currentlyPlaying }) {                                                                                         
  const [comment, setComment] = useState('');                                                                                        
  const [comments, setComments] = useState([]);                                                                                      
                                                                                                                                     
  const handleCommentSubmit = async (e) => {                                                                                         
    e.preventDefault();                                                                                                              
    if (!comment.trim() || !currentlyPlaying) return;                                                                                
                                                                                                                                     
    try {                                                                                                                            
      const response = await axios.post('http://localhost:5000/add_comment', {                                                       
        audioFile: currentlyPlaying,                                                                                                 
        comment: comment                                                                                                             
      });                                                                                                                            
      setComments([...comments, response.data]);                                                                                     
      setComment('');                                                                                                                
    } catch (error) {                                                                                                                
      console.error('Error submitting comment:', error);                                                                             
    }                                                                                                                                
  };                                                                                                                                 
                                                                                                                                     
  return (                                                                                                                           
    <div className="audio-player">                                                                                                   
      {currentlyPlaying ? (                                                                                                          
        <>                                                                                                                           
          <p>Now playing: {currentlyPlaying}</p>                                                                                     
          <div className="comment-section">                                                                                          
            <h3>Comments</h3>                                                                                                        
            <ul>                                                                                                                     
              {comments.map((c, index) => (                                                                                          
                <li key={index}>{c.text}</li>                                                                                        
              ))}                                                                                                                    
            </ul>                                                                                                                    
            <form onSubmit={handleCommentSubmit}>                                                                                    
              <input                                                                                                                 
                type="text"                                                                                                          
                value={comment}                                                                                                      
                onChange={(e) => setComment(e.target.value)}                                                                         
                placeholder="Add a comment..."                                                                                       
              />                                                                                                                     
              <button type="submit">Submit</button>                                                                                  
            </form>                                                                                                                  
          </div>                                                                                                                     
        </>                                                                                                                          
      ) : (                                                                                                                          
        <p>Play an audio to start</p>                                                                                                
      )}                                                                                                                             
    </div>                                                                                                                           
  );                                                                                                                                 
}                                                                                                                                    
                                                                                                                                     
export default AudioPlayer; 