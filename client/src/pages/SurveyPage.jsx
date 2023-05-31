import React from 'react';

import Layout from '../components/Layout';
import Header from '../partials/Header';


function SurveyPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/*  Site header */}
      {/* <Header /> */}

      {/*  Page content */}
      <main className="mx-auto p-3 max-w-3xl pb-14">

        <Layout />

      </main>


    </div>
  );
}

export default SurveyPage;