import React, { useState, useEffect } from 'react';
import './Rtsp.css'; // Importing custom CSS for styling.
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'; // Importing Bootstrap CSS.
import { useNavigate } from 'react-router-dom';

function Rtsp() {
  // Define initial form values and states
  const initialValues = { host: '', port: '' };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();

  // Handle input changes and update form values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // Validate form input values
  const validate = (values) => {
    const errors = {};
    const hostRegex = /^\d{3}$/;
    const portRegex = /^\d{5}$/;

    if (!values.host) {
      errors.host = '*Host number is required';
    } else if (!hostRegex.test(values.host)) {
      errors.host = '*This is not a valid Host Number format!';
    }

    if (!values.port) {
      errors.port = '*Port is required!';
    } else if (!portRegex.test(values.port)) {
      errors.port = '*Enter a valid port!';
    }

    // If host and port are valid, navigate to the home page with the RTSP URL
    if (hostRegex.test(values.host) && portRegex.test(values.port)) {
      navigate(`/home?rtspUrl=${values.host}:${values.port}`);
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors(validate(formValues));
    setIsSubmit(true);
  };

  // Use effect to log form errors when there are any and the form is submitted
  useEffect(() => {
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      console.log(formErrors);
    }
  }, [formErrors, isSubmit]);

  // States for loading indicators during asynchronous actions
  const [isLoadingHost, setIsLoadingHost] = useState(false);
  const [isLoadingPort, setIsLoadingPort] = useState(false);

  // Simulate an asynchronous action and loading indicator for host input
  const toggleHost = () => {
    setIsLoadingHost(true);

    setTimeout(() => {
      setIsLoadingHost(false);
    }, 10000);
  };

  // Simulate an asynchronous action and loading indicator for port input
  const togglePort = () => {
    setIsLoadingPort(true);

    setTimeout(() => {
      setIsLoadingPort(false);
    }, 10000);
  };

  // Handle close button click, navigate back to the home page
  const handleClose = () => {
    navigate('/home');
  };

  return (
    <div className='container-absolute'>
      <section>
        <div className='container-fluid'>
          <div className='row d-flex justify-content-center align-items-center h-100'>
            <h3 className='text-white p-5 text-center text-sm-start'>INTRUDER WATCH</h3>
            <div className='col-12 col-md-9 col-lg-7 col-xl-4'>
              <div className='container' id="rtsp_container">
                <div className='d-flex justify-content-end'>
                  <button type='button' id='close_button' className='btn close' onClick={handleClose}>
                    <span aria-hidden='true' className='text-white'>
                      <h4><kbd>X</kbd></h4>
                    </span>
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className='d-flex flex-row align-items-center justify-content-center'>
                    <h3 className='text-white'>RTSP INPUT FEED</h3>
                  </div>
                  <br />
                  <div className='input-container'>
                    <i className='fa fa-server icon'></i>
                    <input
                      className='input-field'
                      placeholder='Enter your host'
                      name='host'
                      value={formValues.host}
                      onChange={handleChange}
                    />
                    <span onClick={toggleHost}>
                      {isLoadingHost ? (
                        <i className='fa fa-spinner icon'></i>
                      ) : (
                        <i className='fa fa-refresh icon'></i>
                      )}
                    </span>
                  </div>
                  <p className='text-danger'>{formErrors.host}</p>
                  <br />
                  <div className='input-container'>
                    <i className='fa fa-sitemap icon'></i>
                    <input
                      className='input-field'
                      placeholder='Enter your Port'
                      name='port'
                      value={formValues.port}
                      onChange={handleChange}
                    />
                    <span onClick={togglePort}>
                      {isLoadingPort ? (
                        <i className='fa fa-spinner icon'></i>
                      ) : (
                        <i className='fa fa-refresh icon'></i>
                      )}
                    </span>
                  </div>
                  <p className='text-danger'>{formErrors.port}</p>
                  <br />
                  <div className='text-center mt-2 pt-2'>
                    <button type='submit' className='btn btn-success btn-md'>
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Rtsp;
