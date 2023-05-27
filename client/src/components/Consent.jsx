import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./style.css";

function Consent(props) {
  const handleCloseWindow = () => {
    window.close();
  };

  return (
    <div className="text-justify leading-relaxed">
      <h1 className="font-bold pb-3">
        Terms and Conditions
      </h1>
      <h2 className="font-bold">
        Research Study Summary for Potential Subjects
      </h2>
      <p className="pb-4">
        We are studying common sense in society. Participating in this study
        will involve answering basic questions for 10-20 minutes.
      </p>

      <p className="pb-4">
        You are being invited to participate in a research study. Your
        participation is voluntary, and you should only participate if you
        completely understand what the study requires and what the risks of
        participation are. You should ask the study team any questions you have
        related to participating before agreeing to join the study. If you have
        any questions about your rights as a human research participant at any
        time before, during or after participation, please contact the
        Institutional Review Board (IRB) at (215) 898-2614 for assistance.
      </p>
      <p className="pb-4">
        The research study is being conducted to understand the nature of common
        sense in society.
      </p>
      <p className="pb-4">
        If you agree to join the study, you will be asked to complete a short
        survey. Your participation in this aspect of the study will last 10-20
        minutes total.
      </p>
      <p className="pb-4">
        We will accommodate you for participating in this experiment, and
        importantly, participating may help us understand and support teams in a
        scientific context. The most common risks of participation are that
        parts of the study may not be interesting to you. We do not anticipate
        other risks.
      </p>
      <p className="pb-4">
        Please note that there are other factors to consider before agreeing to
        participate such as additional procedures, use of your personal
        information, costs, and other possible risks not discussed here. You are
        free to decline or stop participation at any time during or after the
        initial consenting process.
      </p>
      <h3 className="font-semibold">
        Why was I asked to participate in the study?
      </h3>
      <p className="pb-4">
        Our study requires adults with internet access. You’re being asked to
        participate because you fulfill this requirement.
      </p>
      <h3 className="font-semibold">Where will the study take place?</h3>
      <p className="pb-4">The study will take place on this website.</p>
      <h3 className="font-semibold">What will I be asked to do?</h3>
      <p className="pb-4">
        You will be asked to answer a series of questions about statements as
        well as some other standard survey questions.
      </p>
      <h3 className="font-semibold">What are the risks?</h3>
      <p className="pb-4">
        There are potential risks of disinterest in the activity of the study,
        so it has been designed to be entertaining to make it more engaging.
        There are also potential risks of data security, so the study is
        designed to collect as little information as possible and to store
        information about participants in a secure, anonymized and de-identified
        fashion using password protected servers.
      </p>
      <h3 className="font-semibold">How will I benefit from the study?</h3>
      <p className="pb-4">
        You will be compensated for completing this survey, and may have access
        to a report of your results after completing the survey which will
        provide interesting insights from your participation. This work will
        also be valuable to the broader society, so participating may be
        valuable through that context too.
      </p>
      <h3 className="font-semibold">Will I receive the results of research testing?</h3>
      <p className="pb-4">
        The full results will be made public when the research is shared openly
        upon eventual publication.
      </p>
      <h3 className="font-semibold">What other choices do I have?</h3>
      <p className="pb-4">
        Your alternative to being in the study is to not be in the study. If you
        do not want to be in the study, do not continue this survey and return
        the HIT.
      </p>
      <h3 className="font-semibold">
        What happens if I do not choose to join the research study?
      </h3>
      <p className="pb-4">
        You may choose to join the study or you may choose not to join the
        study. Your participation is voluntary.
      </p>
      <h3 className="font-semibold">
        When is the study over? Can I leave the study before it ends?
      </h3>
      <p className="pb-4">
        The study is expected to end after all participants have completed the
        survey and all the information has been collected. The study may be
        stopped without your consent for the following reasons: The PI feels it
        is best for your safety and/or health-you will be informed of the
        reasons why. You have not followed the study instructions The PI, the
        sponsor or the Institutional Review Board (IRB) at the University of
        Pennsylvania can stop the study anytime
      </p>
      <p className="pb-4">
        You have the right to drop out of the research study at any time during
        your participation. There is no penalty or loss of benefits to which you
        are otherwise entitled if you decide to do so. Withdrawal will not
        interfere with your future care. If you no longer wish to be in the
        research study, please contact Mark Whiting, at 352-226-9212 and inform
        them that you would like to be removed from the study.
      </p>
      <h3 className="font-semibold">
        How will my personal information be protected during the study?
      </h3>
      <p className="pb-4">
        We will do our best to make sure that the personal information obtained
        during the course of this research study will be kept private. However,
        we cannot guarantee total privacy. Your personal information may be
        given out if required by law. If information from this study is
        published or presented at scientific meetings, your name and other
        personal information will not be used. The Institutional Review Board
        (IRB) at the University of Pennsylvania will have access to your
        records. Records will be de-identified and kept privately on secure
        storage. An exception to confidentiality is if you report child or elder
        abuse or neglect, or if you report suicidal or homicidal ideation or
        intent to the research team. Any information about child or elder abuse
        or intent to harm yourself or others will be reported to the
        authorities, as required by law.
      </p>
      <h3 className="font-semibold">
        What may happen to my information collected on this study?
      </h3>
      <p className="pb-4">
        Records will be de-identified and kept privately on secure storage. In
        some cases participant information will be entirely anonymous.
      </p>
      <h3 className="font-semibold">Future Use of Data</h3>
      <p className="pb-4">
        Your information will be de-identified. De-identified means that all
        identifiers have been removed. The information could be stored and
        shared for future research in this de-identified fashion. It would not
        be possible for future researchers to identify you as we would not share
        any identifiable information about you with future researchers. This can
        be done without again seeking your consent in the future, as permitted
        by law. The future use of your information only applies to the
        information collected on this study.
      </p>
      <h3 className="font-semibold">Will I have to pay for anything?</h3>
      <p className="pb-4">
        There are no costs associated with participating in the study.
      </p>
      <h3 className="font-semibold">Will I be paid for being in this study?</h3>
      <p className="pb-4">
        Participation will be compensated directly via the recruitment platform
        after your participation or the completion of the study or as
        information about your participation if you volunteer to take part in
        this study.
      </p>
      <h3 className="font-semibold">
        Who can I call with questions, complaints or if I’m concerned about my
        rights as a research subject?
      </h3>
      <p className="pb-4">
        If you have questions, concerns or complaints regarding your
        participation in this research study or if you have any questions about
        your rights as a research subject, you should speak with Mark Whiting at
        352-226-9212. If a member of the research team cannot be reached or you
        want to talk to someone other than those working on the study, you may
        contact the IRB at (215) 898 2614.
      </p>

      <p className="pb-4">
        <b>
          By continuing in this survey you are agreeing to this research consent
          statement.
        </b>
      </p>

      {/* <div className="flex flex-col items-center pt-7">
        <Link to="/statements">
          <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            I Agree
          </button>
        </Link>
        { <a className="" href="#" onClick={handleCloseWindow}>Disagree and close the window.</a>}
      </div> */}

    </div>
  );
}

export default Consent;
