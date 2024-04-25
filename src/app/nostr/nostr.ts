'use client'
import NDK, { NDKEvent, NDKNip07Signer,NDKRelay } from "@nostr-dev-kit/ndk";
import { eventKind, NostrFetcher } from "nostr-fetch";


export default class nostr {

    signer: NDKNip07Signer;

    relays: string[];

    relaysForSearch: string[];

    ndk: NDK;

    constructor(_relays) {       

        this.relays=_relays;
        this.relaysForSearch=[
            "wss://relay.nostr.band"
        ]

        this.signer = new NDKNip07Signer();

        this.ndk = new NDK({
            enableOutboxModel: false,
            signer: this.signer,
            autoConnectUserRelays: false,
            explicitRelayUrls: _relays
        });

        this.ndk.pool.on("relay:connect", (r: NDKRelay) => { console.log(`Connected to relay ${r.url}`); });        
    }

    async setUp(_onlineRelays) {
        //this.relays=_onlineRelays;
        console.log(this.relays)
        //const relays = this.relaysFromArgs();

        /*
        for (const relay of relays) {
            this.ndk.addExplicitRelay(relay, undefined, false);
            console.log(relay.url)
        }
        */

        await this.ndk.connect(8000);
    }

    async subscribe() {
        const a = await this.ndk.subscribe({ kinds: [0, 1] }, { closeOnEose: false });
        a.on("event", (event) => console.log(`received event on a`, event.id, event.content));
        a.on("eose", () => console.log(`received eose on a`));
    }


    async publish(jsonToPublish){
        const ndkEvent = new NDKEvent(this.ndk);
        ndkEvent.kind = eventKind.text;
        ndkEvent.content = JSON.stringify(jsonToPublish);
        const rels=await ndkEvent.publish();
        return rels
    }

    async testFetcher(wordQuery) {
        console.log("trying fetcher")
        const nHoursAgo = (hrs: number): number => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);

        const fetcher = NostrFetcher.init();

        // fetch all the text events (kind: 1) which match the search query and have posted in the last 24 hours
        try{
        const eventsIter = await fetcher.fetchAllEvents(
            this.relaysForSearch,//1
            {
                kinds: [eventKind.text],//2
                search: wordQuery,
            },
            {//3
                since: nHoursAgo(24*30),//30 days of wagers 
            },
            { sort: true },//4
            /*

            {//4
                skipVerification: true,
            },

            */
        );
        fetcher.shutdown();
        return eventsIter
        }catch(e){
            console.log(e)
        }


    }

    /*
    async fetchWagers(){
        return testFetcher("bitcoin")
    }
    */

    async getUserProfile() {
        let userProfile;

        try{
        userProfile=await this.signer.user()
        }catch(e){
            throw e
        }
        if(userProfile){
            console.log(userProfile.npub)
            const u = await this.ndk.getUser({
                npub: userProfile.npub,
            });
            console.log(u)
            await u.fetchProfile();
            console.log(u.profile)
            return u.profile;
        }else{
            return null;
        }
        
    }


    async getRandomProfile(randomNpub){
        try{
            const u = await this.ndk.getUser({
                npub: randomNpub,
            });
            console.log(u)
            await u.fetchProfile();
            console.log(u.profile)
            return u.profile;
            }catch(e){
                console.log(e)
            }
    }


    relaysFromArgs(): NDKRelay[] {
        const explicitRelayUrls: string[] = [];
        const trustedRelayUrls: string[] = [];
        const relays: NDKRelay[] = [];
    
        // go through the command line arguments and load all URLs that start with ws:// or wss:// in the explicitRelayUrls array
        for (let i = 2; i < process.argv.length; i++) {
            const arg = process.argv[i];
    
            if (arg === "--trusted" && i + 1 < process.argv.length) {
                const nextArg = process.argv[i + 1];
                if (nextArg.startsWith("ws://") || nextArg.startsWith("wss://")) {
                    trustedRelayUrls.push(nextArg);
                    i++; // Skip the next iteration as it is already processed
                    continue;
                }
            }
    
            if (arg.startsWith("ws://") || arg.startsWith("wss://")) {
                explicitRelayUrls.push(arg);
            }
        }
    
        // if there are no explicit relay URLs, use the default ones
        if (explicitRelayUrls.length === 0) {
            explicitRelayUrls.push(...this.relays);
        }
    
        for (const url of explicitRelayUrls) {
            const relay = new NDKRelay(url);
            relays.push(relay);
        }
    
        for (const url of trustedRelayUrls) {
            const relay = new NDKRelay(url);
            relay.trusted = true;
            relays.push(relay);
        }
    
        return relays;
    }



}