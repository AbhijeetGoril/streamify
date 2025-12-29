import {
  Call,
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const VideoCall = ({ call }) => {
  return (
    <Call call={call}>
      <SpeakerLayout />
      <CallControls />
    </Call>
  );
};

export default VideoCall;
