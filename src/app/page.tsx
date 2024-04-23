'use client'
import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "flowbite-react";

import SearchBox from '@/app/components/SearchBox'
import WagerList from '@/app/components/WagerList'
import nostr from "@/app/nostr/nostr"

//import { CircleSpinnerOverlay, RingSpinnerOverlay } from 'react-spinner-overlay'

let ndk;
export default function Home() {

  //const ndk = new nostr();
  const [spinLoader, setSpinLoader] = useState(true);
  const [bets, setBets] = useState([]);

  const [name, setName] = useState();
  const [userName, setUserName] = useState();
  const [showWagers, setShowWagers] = useState(false);

  useEffect(() => {
    console.log("user effect")
    async function nostrTest() {
      const onlineRelays = await getOnlineRelays(40)

      ndk = new nostr(onlineRelays)

      await ndk.setUp(onlineRelays);
      const profile = await ndk.getUserProfile()

      setUserName(profile.username)
      setName(profile.name)
      setSpinLoader(false)

      //const res=await ndk.testFetcher("bitcoin");
      //console.log(res)
    }
    nostrTest()
  }, [])


  const getOnlineRelays = async (firstNRelaysOnly) => {
    const response = await fetch('https://api.nostr.watch/v1/online');
    const jsonData = await response.json();
    return jsonData.slice(0, firstNRelaysOnly)
  }


  const nostrSubmit = async (wager, amount, expiry) => {
    setSpinLoader(true)
    const jsonToPublish = {
      ibetchathat: {
        wager: wager,
        amount: amount,
        expiry: expiry,
        url: ""
      }
    }
    try {
      const rels = await ndk.publish(jsonToPublish);
      toast.success(`Wager published to NOSTR to ${rels.size} relays`)
    } catch (e: any) {
      console.log(e)
      toast.error(e.toString())
    }
    setSpinLoader(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <ToastContainer />

    {/* typeof window !== undefined ?
      <RingSpinnerOverlay loading={spinLoader} /> : <div></div>
  */}

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          $ betcha front end prototype $ <br /> Welcome {name} ({userName})
        </p>
      </div>
      <div className="newWagerFormBox">
        <SearchBox nostrSubmit={nostrSubmit} ></SearchBox>
      </div>

      <div className='seeWagersButtonBox'>
        <Button type="submit" onClick={(e) => {
          e.preventDefault();
          setShowWagers(true)
        }}>Load Wagers</Button>
      </div>
      {showWagers ?
        <div className="wagerListBox">
          <WagerList nostr={ndk}></WagerList>
        </div> : <div></div>
      }
    </main>
  );
}
