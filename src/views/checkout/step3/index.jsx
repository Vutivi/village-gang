import { CHECKOUT_STEP_1 } from '@/constants/routes';
import { Form, Formik } from 'formik';
import { displayActionMessage } from '@/helpers/utils';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';
import { StepTracker } from '../components';
import withCheckout from '../hoc/withCheckout';
import CreditPayment from './CreditPayment';
import PayPalPayment from './PayPalPayment';
import Total from './Total';
import firebase from '@/services/firebase';

const Payment = ({ shipping, payment, subtotal, basket, profile }) => {
  useDocumentTitle('Check Out Final Step | Village Gang');
  useScrollTop();

  const initFormikValues = {
    type: payment.type || 'payfast'
  };

  const onConfirm = () => {
    firebase.addOrder({
      items: basket,
      userId: firebase.auth.currentUser.uid,
      user: profile,
      isInternational: shipping.isInternational,
      subtotal: `${subtotal.toFixed(0)}`,
      status: 'created'
    }).then((response) => {
      window.location = `https://www.payfast.co.za/eng/process?cmd=_paynow&receiver=25266561&item_name=Village Gang Order&item_description=Village+Gang+Order&amount=${subtotal.toFixed(2)}&return_url=https://master--village-gang.netlify.app/account&cancel_url=https://master--village-gang.netlify.app`;
    })
  };

  if (!shipping || !shipping.isDone) {
    return <Redirect to={CHECKOUT_STEP_1} />;
  }
  return (
    <div className="checkout">
      <StepTracker current={3} />
      <Formik
        initialValues={initFormikValues}
        validateOnChange
        onSubmit={onConfirm}
      >
        {() => (
          <Form className="checkout-step-3">
            <PayPalPayment />
            <Total
              isInternational={shipping.isInternational}
              subtotal={subtotal}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
};

Payment.propTypes = {
  shipping: PropType.shape({
    isDone: PropType.bool,
    isInternational: PropType.bool
  }).isRequired,
  payment: PropType.shape({
    type: PropType.string
  }).isRequired,
  subtotal: PropType.number.isRequired,
  profile: PropType.shape({
    fullname: PropType.string,
    email: PropType.string,
    address: PropType.string,
    mobile: PropType.object
  }).isRequired,
  basket: PropType.arrayOf(PropType.object).isRequired
};

export default withCheckout(Payment);
