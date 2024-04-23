
"use client";

import { Button, Checkbox, Label, TextInput, Datepicker } from "flowbite-react";
import { useState, useEffect } from 'react'

export default function SearchBox({nostrSubmit}) {

    const [wager, setWager] = useState("");
    const [amount, setAmount] = useState("");
    const [expiry, setExpiry] = useState((Date.parse(new Date().toDateString())/1000));

    return (
        <form className="flex max-w-md flex-col gap-4">
            <div>
                <div className="mb-2 block">
                    <Label htmlFor="betcha" value="Betcha that" />
                </div>
                <TextInput onChange={(e)=>{
                    setWager(e.target.value)
                }} id="betcha" type="text" placeholder="Bitcoin hits 100k USD" required />
            </div>
            <div>
                <div className="mb-2 block">
                    <Label htmlFor="wager" value="Wager amount in sats" />
                </div>
                <TextInput onChange={(e)=>{
                    setAmount(e.target.value)
                }} id="wager" type="number" required placeholder="1000000" />
            </div>
            <div>
                <div className="mb-2 block">
                    <Label htmlFor="expiry" value="Wager expiry " />
                </div>
                <Datepicker minDate={new Date()} defaultDate={new Date()} onSelectedDateChanged={(dateString)=>{
                    console.log(dateString)
                    const unixTime = Math.floor(Date.parse(dateString.toDateString()) / 1000);
                    console.log(unixTime)
                    setExpiry(unixTime)
                }}/>
            </div>
            <Button type="submit" onClick={(e)=>{
                e.preventDefault();
                console.log("hello")
                console.log(wager)
                console.log(amount)
                console.log(expiry)
                nostrSubmit(wager,amount,expiry)
            }}>Submit Wager</Button>
        </form>
    );
}
