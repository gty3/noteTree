
import { Auth } from '@aws-amplify/auth'
import { useContext, useEffect, useState } from 'react'
import { CreatePageProps, PageProps } from '../../../utils/types';


export default function Google(props: CreatePageProps) {
  const { updateAuth } = props

  const initGapi = () => {
    // init the Google SDK client
    const g = window.gapi;
    g.load('auth2', function () {
      g.auth2.init({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT,
        // authorized scopes
        scope: 'profile email openid'
      });
    });
  }

  const createScript = () => {
    // load the Google SDK
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/platform.js'
    script.async = true
    script.onload = initGapi
    document.getElementById('div').appendChild(script)
    console.log('script', script)
  }

  const getAWSCredentials = async (googleUser) => {
    const { id_token, expires_at } = googleUser.getAuthResponse();
    const profile = googleUser.getBasicProfile();
    let user = {
      email: profile.getEmail(),
      name: profile.getName()
    };

    const credentials = await Auth.federatedSignIn(
      'google',
      { token: id_token, expires_at },
      user
    );
    console.log('credentials', credentials);
  }
  
  const signIn = () => {
    const ga = window.gapi.auth2.getAuthInstance();
    ga.signIn().then(
      googleUser => {
        getAWSCredentials(googleUser)
        updateAuth(true)
      },
      error => {
        console.log(error);
      }
    );
  }


  useEffect(() => {
    const ga = window.gapi && window.gapi.auth2 ?
      window.gapi.auth2.getAuthInstance() :
      null;

    if (!ga) createScript();
  }, [])

  return (
    <>
      <div id="div">
        <button onClick={signIn}>
          <div className="flex flex-row">
          <div className="mr-3">
            <img width="20px" alt="Google sign-in"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" 
            />
          </div>
          <div>Sign in with Google</div>
          </div>
        </button>

      </div>
    </>
  )
}