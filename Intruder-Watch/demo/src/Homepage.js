 
 // Define the structure of the main component and set the page title.
// Create a dropdown to select webcams and an input form for RTSP streaming.
// Display the streaming video and provide controls like start/stop and undo.
// Implement a toggle for switching between AI mode and Normal mode.
// Design the offcanvas for intruder alerts and include a logout button.
//To execute open terminal and cd demo->npm i->npm start and it wiil start the server type localhost:3000 in web browser 
// Import necessary React components and libraries
import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Homepage.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import ReactSwitch from 'react-switch';
import { useLocation } from 'react-router-dom';
import { auth } from './Firebase';
import ReactPlayer from 'react-player';
// State variables for various settings
function HomePage() {
  const [checked, setChecked] = useState(false);// Streaming status state
  const [streaming, setStreaming] = useState(false);
  const [selectedWebcam, setSelectedWebcam] = useState('');// Selected webcam state
  const [connectedWebcams, setConnectedWebcams] = useState([]);// List of available webcams
  const [useWebcam, setUseWebcam] = useState(false);// Flag for using webcam or RTSP
  const webcamVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const location = useLocation();
  const [rtspUrl, setRtspUrl] = useState('');// RTSP URL for streaming
  const [drawing, setDrawing] = useState(false);// Drawing mode state
  const [drawnLines, setDrawnLines] = useState([]);// Array to store drawn lines
  const [aiMode, setAiMode] = useState(false);// AI mode flag
  const canvasRef = useRef(null);
  const [cursorStyle, setCursorStyle] = useState('default');// Cursor style for drawing
  const [drawingInProgress, setDrawingInProgress] = useState(false);// Drawing in progress state
  const [startX, setStartX] = useState(0);// Starting X coordinate for drawing lines
  const [startY, setStartY] = useState(0); // Starting Y coordinate for drawing lines
  const [undoAvailable, setUndoAvailable] = useState(false);// Flag for undo availability
// Function to start drawing a line
  const startDragLine = (e) => {
    setStartX(e.nativeEvent.offsetX);
    setStartY(e.nativeEvent.offsetY);
    setDrawingInProgress(true);
  };
// Function to continue drawing a line
  const continueDragLine = (e) => {
    if (drawingInProgress) {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      const updatedLines = [...drawnLines];
      const lastIndex = updatedLines.length - 1;
      updatedLines[lastIndex].x2 = x;
      updatedLines[lastIndex].y2 = y;
      setDrawnLines(updatedLines);
    }
  };
// Function to stop drawing a line
  const stopDragLine = () => {
    if (drawingInProgress) {
      setDrawingInProgress(false);
      setUndoAvailable(true); // Set undoAvailable to true when drawing stops
    }
  };

  // Function to undo the last drawn line
  const undoLastLine = () => {
    if (drawnLines.length > 0) {
      // Create a copy of the current drawn lines
      const updatedLines = [...drawnLines];
      // Remove the last drawn line
      updatedLines.pop();
      // Update the state with the updated lines
      setDrawnLines(updatedLines);

      // If there are no more lines, set undoAvailable to false
      if (updatedLines.length === 0) {
        setUndoAvailable(false);
      }
    }
  };
// Function to initialize drawing event listeners
  const init = () => {
    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousedown', startDragLine);
      canvasRef.current.addEventListener('mousemove', continueDragLine);
      canvasRef.current.addEventListener('mouseup', stopDragLine);
    }
  };
 // Initialize drawing event listeners on component mount
  useEffect(() => {
    init(); // Call the init function here
    return () => {
      if (canvasRef.current) {
         // Remove drawing event listeners on component unmount
        canvasRef.current.removeEventListener('mousedown', startDragLine);
        canvasRef.current.removeEventListener('mousemove', continueDragLine);
        canvasRef.current.removeEventListener('mouseup', stopDragLine);
      }
    };
  }, []);
// Function to start streaming video based on device selection
  const startStreaming = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const deviceIdFromParam = params.get('deviceId');

    if (deviceIdFromParam && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setSelectedWebcam(deviceIdFromParam);
    } else {
      setSelectedWebcam('');
    }
  }, [location.search]);
// Function to start local video streaming
  const startLocalVideo = useCallback(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { deviceId: { exact: selectedWebcam } } })
        .then((stream) => {
          localVideoRef.current.srcObject = stream;
          setUseWebcam(true);
          setStreaming(true);
        })
        .catch((error) => {
          console.error('Error accessing webcam:', error);
        });
    }
  }, [selectedWebcam]);
  // Function to start streaming video from the selected webcam
  const startStreamingVideo = useCallback(() => {
    if (selectedWebcam && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { deviceId: { exact: selectedWebcam } } })
        .then((stream) => {
          webcamVideoRef.current.srcObject = stream;
          setUseWebcam(true);
          setStreaming(true);
        })
        .catch((error) => {
          console.error('Error accessing selected webcam:', error);
          startLocalVideo();
        });
    } else {
      startLocalVideo();
    }
  }, [selectedWebcam, startLocalVideo]);
// Function to start RTSP streaming
  const startRTSPStreaming = useCallback(() => {
    if (rtspUrl) {
      const video = document.getElementById('video');
      if (video) {
        video.src = rtspUrl;
        video.play();
        setStreaming(true);
      }
    }
  }, [rtspUrl]);
  // Function to stop video streaming
  const stopStreaming = useCallback(() => {
    const stream = useWebcam ? webcamVideoRef.current?.srcObject : localVideoRef.current?.srcObject;
    if (stream && streaming) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      if (useWebcam) {
        webcamVideoRef.current.srcObject = null;
      } else {
        localVideoRef.current.srcObject = null;
      }
      setStreaming(false);
    }
  }, [streaming, useWebcam]);

  const handleMouseDown = (event) => {
    // Check if the AI mode is enabled.
    if (aiMode) {
      // Set the drawing state to true.
      setDrawing(true);

      // Set the cursor style to crosshair.
      setCursorStyle('crosshair');

      // Get the canvas element.
      const canvas = canvasRef.current;

      // Check if the canvas element exists.
      if (canvas) {
        // Get the canvas context.
        const ctx = canvas.getContext('2d');

        // Get the bounding rectangle of the canvas.
        const rect = canvas.getBoundingClientRect();

        // Get the mouse coordinates relative to the canvas.
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Create a new line object.
        const newLine = { x1: x, y1: y, x2: x, y2: y };

        // Add the new line object to the drawnLines state array.
        setDrawnLines([...drawnLines, newLine]);

        // Set the cursor style of the canvas to crosshair.
        canvas.style.cursor = 'crosshair';
      }
    }
  };
// Function to handle mouse movement when drawing
  const handleMouseMove = (event) => {
    if (drawing) {
      if (aiMode) {
        const canvas = canvasRef.current;
        if (canvas) { // Get the canvas context.
          const ctx = canvas.getContext('2d'); // Get the bounding rectangle of the canvas.
          const rect = canvas.getBoundingClientRect(); // Calculate the mouse coordinates relative to the canvas.
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const updatedLines = [...drawnLines]; // Create a copy of the drawn lines.
          const lastIndex = updatedLines.length - 1;// Get the index of the last drawn line.
          updatedLines[lastIndex].x2 = x;// Update the end coordinates of the last drawn line with the current mouse position.
          updatedLines[lastIndex].y2 = y;
          setDrawnLines(updatedLines);// Update the state with the updated lines.
          renderLines(updatedLines);
          canvas.style.cursor = 'crosshair';// Update the state with the updated lines.
        }
      }
    }
  };
// Function to handle mouse release when drawing is in progress
  const handleMouseUp = () => {
    if (drawing) {
      setDrawing(false);
      setCursorStyle('default');
    }
  };
// Function to render lines on the canvas
  const renderLines = (linesToRender) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      linesToRender.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      });
    }
  };
   // Start streaming and set up initial configurations when the component mounts.

  // Start streaming video

  useEffect(() => {
    startStreaming();
    startStreamingVideo();
    startRTSPStreaming();
// Handle dropdown menu interactions
    const dropdownToggle = document.getElementById('configureDropdown');
    const dropdownMenu = document.getElementById('configureDropdownMenu');
    dropdownToggle.addEventListener('click', function () {
      dropdownMenu.classList.toggle('show');
    });

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputDevices = devices.filter((device) => device.kind === 'videoinput');
      setConnectedWebcams(videoInputDevices);
    });

    document.addEventListener('click', function (event) {
      const isDropdownToggle = dropdownToggle.contains(event.target);
      const isDropdownMenu = dropdownMenu.contains(event.target);
      if (!isDropdownToggle && !isDropdownMenu) {
        dropdownMenu.classList.remove('show');
      }
    });
    // Clean up and stop streaming when the component unmounts
    return () => {
      stopStreaming();
      dropdownToggle.removeEventListener('click', function () {
        dropdownMenu.classList.toggle('show');
      });
      document.removeEventListener('click', function (event) {
        const isDropdownToggle = dropdownToggle.contains(event.target);
        const isDropdownMenu = dropdownMenu.contains(event.target);
        if (!isDropdownToggle && !isDropdownMenu) {
          dropdownMenu.classList.remove('show');
        }
      });
    };
  }, [startStreaming, startStreamingVideo, startRTSPStreaming, stopStreaming, startLocalVideo]);
// Function to handle changing the selected webcam
  const handleChangeWebcam = (event) => {
    setSelectedWebcam(event.target.value);
    setStreaming(false);
  };
// Function to handle RTSP input field change
  const handleRTSPInputChange = (event) => {
    setRtspUrl(event.target.value);
    setStreaming(false);
  };
// Function to start RTSP streaming
  const handleRTSPSubmit = (event) => {
    event.preventDefault();
    startRTSPStreaming();
  };
// Function to handle dropdown menu option clicks
  const handleConfigureDropdownClick = (e) => {
    e.preventDefault();
    const selectedOptionId = e.target.id;
    if (selectedOptionId === 'd-1') {
      window.location.href = '/Rtsp';
    } else if (selectedOptionId === 'd-2') {
      window.location.href = '/Usb';
    }
  };
// Function to handle changing between AI mode and Normal mode
  const handleChange = () => {
    setChecked((prevChecked) => !prevChecked);
    setAiMode((prevAiMode) => !prevAiMode);
  };
// Function to handle user logout
  const logout = () => {
    auth
      .signOut()
      .then(() => {
        window.location.href = '/';
      })
      .catch((error) => {
        console.error(error);
      });
  };


  // Define the structure of the main component and set the page title.
// Create a dropdown to select webcams and an input form for RTSP streaming.
// Display the streaming video and provide controls like start/stop and undo.
// Implement a toggle for switching between AI mode and Normal mode.
// Design the offcanvas for intruder alerts and include a logout button.


  return (
    <div className="scrollable-wrapper">
      <div className="overflow">
        <section>
          <div className="container" id="main-container">
            <div className="row">
              <div className="col-md-9 col-lg-6 col-xl-8">
                <h3 className="text-white p-3 text-center text-md-start">INTRUDER WATCH</h3>
                <select
                  className="form-select"
                  aria-label="Dropdown"
                  value={selectedWebcam}
                  onChange={handleChangeWebcam}
                >
                  <option value="">Select an input CCTV</option>
                  {connectedWebcams.map((webcam) => (
                    <option key={webcam.deviceId} value={webcam.deviceId}>
                      {webcam.label || `Webcam ${connectedWebcams.indexOf(webcam) + 1}`}
                    </option>
                  ))}
                </select>
                {selectedWebcam && (
                  <p style={{ color: 'white', margin: '10px ' }}>
                    Selected Camera:{' '}
                    {connectedWebcams.find((webcam) => webcam.deviceId === selectedWebcam)?.label ||
                      `Webcam ${connectedWebcams.findIndex((webcam) => webcam.deviceId === selectedWebcam) + 1}`}
                  </p>
                )}
                <form onSubmit={handleRTSPSubmit} className="mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter RTSP URL"
                    value={rtspUrl}
                    onChange={handleRTSPInputChange}
                  />
                  <button type="submit" className="btn btn-primary mt-2">
                    Start RTSP Streaming
                  </button>
                </form>
              </div>
              <div className="col-md-3 col-lg-6 col-xl-3 offset-xl-1" id="configure">
                <div className="container text-center text-md-start">
                  <div className="dropdown">
                    <a
                      className="btn btn-secondary dropdown-toggle"
                      href="#!"
                      role="button"
                      id="configureDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Confgure Manually
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="configureDropdown" id="configureDropdownMenu">
                      <li>
                        <a className="dropdown-item" href="/Rtsp" id="d-1" onClick={handleConfigureDropdownClick}>
                          RTSP INPUT
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="/Usb" id="d-2">
                          USB INPUT
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="row pt-5">
              <div className="col-md-11 col-lg-11 col-xl-11 justify-content-center align-self-center">
                <div className="embed-responsive embed-responsive-16by9 position-relative">
                  {streaming ? (
                    useWebcam ? (
                      <div className="position-relative">
                        <video
                          ref={webcamVideoRef}
                          className="embed-responsive-item"
                          style={{
                            borderStyle: 'dotted',
                            borderWidth: '15px',
                            borderColor: 'yellow',
                            width: '100%',
                          }}
                          autoPlay
                        ></video>
                        <canvas
                          ref={canvasRef}
                          id="lineDrawingCanvas"
                          className="position-absolute"
                          style={{
                            bottom: 0,
                            left: 0,
                            zIndex: 1,
                            width: '100%',
                            height: '100%',
                            cursor: cursorStyle,
                          }}
                          width={webcamVideoRef.current?.videoWidth}
                          height={webcamVideoRef.current?.videoHeight}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                        ></canvas>
                      </div>
                    ) : (
                      <div className="position-relative">
                        <ReactPlayer
                          url={rtspUrl}
                          className="react-player embed-responsive-item"
                          style={{
                            borderStyle: 'dotted',
                            borderWidth: '15px',
                            borderColor: 'yellow',
                            width: '100%',
                            height: 'auto',
                          }}
                          playing={true}
                          controls={true}
                          width="100%"
                          height="auto"
                        />
                        <canvas
                          ref={canvasRef}
                          id="lineDrawingCanvas"
                          className="position-absolute"
                          style={{
                            bottom: 0,
                            left: 0,
                            zIndex: 1,
                            width: '100%',
                            height: '100%',
                            cursor: cursorStyle,
                          }}
                          width={webcamVideoRef.current?.videoWidth}
                          height={webcamVideoRef.current?.videoHeight}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                        ></canvas>
                      </div>
                    )
                  ) : (
                    <video
                      ref={localVideoRef}
                      src="/cctv.mp4"
                      className="embed-responsive-item"
                      style={{
                        borderStyle: 'dotted',
                        borderWidth: '10px',
                        borderColor: 'yellow',
                        width: '100%',
                      }}
                      autoPlay
                    ></video>
                  )}
                </div>

                <div className="mt-2 pt-2">
                  <button
                    type="button"
                    className={`btn ${streaming ? 'btn-danger' : 'btn-success'}`}
                    onClick={streaming ? stopStreaming : startRTSPStreaming}
                  >
                    {streaming ? 'Stop Streaming' : 'Start Streaming'}
                  </button>
                  <button
  type="button"
  className="btn btn-primary ml-2"
  onClick={undoLastLine}
  
>
  Undo
</button>

                  <div className={`d-flex float-end ${checked ? 'ai-mode' : 'normal-mode'}`}>
                    <ReactSwitch checked={checked} onChange={handleChange} className="d-flex" />
                    <span style={{ color: 'yellow', fontSize: '20px', fontWeight: 'bold' }}>
                      {checked ? 'AI Mode' : 'Normal Mode'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="d-md-none">
                <i
                  className="fa fa-arrow-circle-left"
                  style={{ fontSize: '60px', color: 'orange', paddingTop: '20px', position: 'relative' }}
                  data-bs-toggle="offcanvas"
                  data-bs-target="#demo"
                ></i>
              </div>
              <div className="col-md-1 col-lg-1 col-xl-1 d-none d-md-block">
                <i
                  className="fa fa-arrow-circle-left"
                  style={{
                    fontSize: '60px',
                    color: 'orange',
                    paddingTop: '150px',
                    position: 'absolute',
                    paddingRight: '20px',
                    right: '0',
                  }}
                  data-bs-toggle="offcanvas"
                  data-bs-target="#demo"
                ></i>
              </div>
            </div>
            <div className="offcanvas offcanvas-end" id="demo">
              <div className="offcanvas-header">
                <h1 className="offcanvas-title text-danger">Intruder Alert</h1>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
              </div>
              <div className="offcanvas-body">
                <div className="d-flex justify-content-center">
                  <img
                    src="https://videos.cctvcamerapros.com/wp-content/files/IP-security-camera-AI-person-detection.jpg"
                    className="img-fluid"
                    alt="Intruder"
                  />
                </div>
                <br />
                <h4 className="text-center border" style={{ padding: '5px' }}>
                  Alert Time: 10.45 PM
                </h4>
              </div>
            </div>
            <div className="row mt-3 justify-content-center">
              <div className="col-auto">
                <button type="button" onClick={logout} className="btn btn-danger">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
