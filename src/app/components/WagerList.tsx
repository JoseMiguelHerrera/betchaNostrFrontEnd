
"use client";

import { Button, Checkbox, Label, TextInput, Datepicker,Table } from "flowbite-react";
import { useState, useEffect } from 'react'
import LoadingOverlay from 'react-loading-overlay-ts';

export default function WagerList({nostr}) {

    const [results, setResults] = useState([] as any[]);
    const [spinLoader, setSpinLoader] = useState(true);

    const cleanResults = (rawResults) => {
      let results:any[] = [];
      rawResults.forEach((r)=>{
        const pubkey=r.pubkey;
        const content = (JSON.parse(r.content)).ibetchathat;
        
        const amount = content.amount;
        const wager = content.wager;
        const expiry = content.expiry;
        const url = content.url;
        results.push({
          pubkey,
          amount,
          wager,
          expiry,
          url
        })
      })
      return results;
    }

    useEffect(() => {
        console.log("user effect wagerlist")
        async function nostrSearch() {
          const searchResults=await nostr.testFetcher("ibetchathat")
          console.log(searchResults)
          const searchResultsClean=cleanResults(searchResults)
          console.log(searchResultsClean)
          setResults(searchResultsClean)
          setSpinLoader(false)
        }
        nostrSearch()
      }, [nostr])

      const createTableRows = (data) => {
        return data.map((item, index) => (
          <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {item.wager}
            </Table.Cell>
            <Table.Cell>{item.amount}</Table.Cell>
            <Table.Cell>{item.pubkey}</Table.Cell>
            <Table.Cell>{unixTimeToDateString(item.expiry)}</Table.Cell>
            <Table.Cell>
              <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                Take Wager
              </a>
            </Table.Cell>
          </Table.Row>
        ));
      };

      const unixTimeToDateString =(unixTime) =>{
        const date = new Date(unixTime * 1000); // Multiply by 1000 to convert seconds to milliseconds
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true
        };
        return date.toLocaleString(undefined, options);
      }

      return (
        <LoadingOverlay
        active={spinLoader}
        spinner
        text='Loading NOSTR Data'
      >
        <div className="overflow-x-auto">
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Wager</Table.HeadCell>
              <Table.HeadCell>Amount (SATS)</Table.HeadCell>
              <Table.HeadCell>Counterparty (NPUB)</Table.HeadCell>
              <Table.HeadCell>Expires</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Participate</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
             { results ? createTableRows(results) : <div></div>}
            </Table.Body>
          </Table>
        </div>
        </LoadingOverlay>
      );
}