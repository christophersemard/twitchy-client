"use client";
import dynamic from "next/dynamic";
// import HLSStreamPlayer from "./Components/HLSStreamPlayer";
import Player from "./Components/StreamPlayer";
import TestFrameImage from "./Components/TestFrameImage";

export default function Page() {
    return (
        <div
            style={{
                maxWidth: "800px",
                margin: "2rem auto",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h1>Projet Twitchy – Client Récepteur</h1>
            <Player />
            {/* <HLSStreamPlayer /> */}
            {/* <TestFrameImage /> */}
        </div>
    );
}
