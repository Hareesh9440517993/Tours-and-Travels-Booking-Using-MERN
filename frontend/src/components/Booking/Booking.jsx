import React, { useState, useContext } from 'react';
import './booking.css';
import { Form, FormGroup, ListGroup, ListGroupItem, Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../utils/config';
import { QRCodeCanvas } from 'qrcode.react'; // For generating the QR Code

const Booking = ({ tour, avgRating }) => {
   const { price, reviews, title } = tour;
   const navigate = useNavigate();

   const { user } = useContext(AuthContext);

   const [booking, setBooking] = useState({
      userId: user && user._id,
      userEmail: user && user.email,
      tourName: title,
      fullName: '',
      phone: '',
      guestSize: 1,
      bookAt: ''
   });

   const [isPopupOpen, setPopupOpen] = useState(false); // State to control the popup

   const handleChange = (e) => {
      setBooking((prev) => ({ ...prev, [e.target.id]: e.target.value }));
   };

   const serviceFee = 10;
   const totalAmount = Number(price) * Number(booking.guestSize) + Number(serviceFee);

   const handleClick = async (e) => {
      e.preventDefault();
      console.log(booking);

      try {
         if (!user || user === undefined || user === null) {
            return alert('Please sign in');
         }

         const res = await fetch(`${BASE_URL}/booking`, {
            method: 'post',
            headers: {
               'content-type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(booking),
         });

         const result = await res.json();

         if (!res.ok) {
            return alert(result.message);
         }

         // Open the popup after booking is successful
         setPopupOpen(true);
      } catch (error) {
         alert(error.message);
      }
   };

   const handlePayNow = () => {
      // Close the popup and navigate to the thank-you page
      setPopupOpen(false);
      navigate('/thank-you');
   };

   return (
      <div className="booking">
         <div className="booking__top d-flex align-items-center justify-content-between">
            <h3>${price} <span>/per person</span></h3>
            <span className="tour__rating d-flex align-items-center">
               <i className="ri-star-fill" style={{ color: 'var(--secondary-color)' }}></i>
               {avgRating === 0 ? null : avgRating} ({reviews?.length})
            </span>
         </div>

         {/* =============== BOOKING FORM START ============== */}
         <div className="booking__form">
            <h5>Information</h5>
            <Form className="booking__info-form" onSubmit={handleClick}>
               <FormGroup>
                  <input type="text" placeholder="Full Name" id="fullName" required onChange={handleChange} />
               </FormGroup>
               <FormGroup>
                  <input type="tel" placeholder="Phone" id="phone" required onChange={handleChange} />
               </FormGroup>
               <FormGroup className="d-flex align-items-center gap-3">
                  <input type="date" placeholder="" id="bookAt" required onChange={handleChange} />
                  <input type="number" placeholder="Guest" id="guestSize" required onChange={handleChange} />
               </FormGroup>
            </Form>
         </div>
         {/* =============== BOOKING FORM END ================ */}

         {/* =============== BOOKING BOTTOM ================ */}
         <div className="booking__bottom">
            <ListGroup>
               <ListGroupItem className="border-0 px-0">
                  <h5 className="d-flex align-items-center gap-1">${price} <i className="ri-close-line"></i> 1 person</h5>
                  <span> ${price}</span>
               </ListGroupItem>
               <ListGroupItem className="border-0 px-0">
                  <h5>Service charge</h5>
                  <span>${serviceFee}</span>
               </ListGroupItem>
               <ListGroupItem className="border-0 px-0 total">
                  <h5>Total</h5>
                  <span>${totalAmount}</span>
               </ListGroupItem>
            </ListGroup>

            <Button className="btn primary__btn w-100 mt-4" onClick={handleClick}>Book Now</Button>
         </div>

         {/* =============== POPUP CONTAINER ================ */}
         <Modal isOpen={isPopupOpen} toggle={() => setPopupOpen(!isPopupOpen)} centered>
            <ModalHeader toggle={() => setPopupOpen(!isPopupOpen)}>Payment Details</ModalHeader>
            <ModalBody>
               <ListGroup>
                  <ListGroupItem className="d-flex justify-content-between">
                     <span>Price:</span>
                     <span>${price}</span>
                  </ListGroupItem>
                  <ListGroupItem className="d-flex justify-content-between">
                     <span>Service Fee:</span>
                     <span>${serviceFee}</span>
                  </ListGroupItem>
                  <ListGroupItem className="d-flex justify-content-between">
                     <span>Total Amount:</span>
                     <span>${totalAmount}</span>
                  </ListGroupItem>
               </ListGroup>

               {/* QR Code Section */}
               <div className="qr-code my-3 d-flex justify-content-center">
                  <QRCodeCanvas value={`Total Amount: $${totalAmount}`} size={150} />
               </div>

               <Button className="btn primary__btn w-100" onClick={handlePayNow}>Pay Now</Button>
            </ModalBody>
         </Modal>
      </div>
   );
};

export default Booking;
