import React from 'react';
import { InfoDisclosure } from './common/InfoDisclosure';

const InterpretationNotes = () => {
  return (
    <InfoDisclosure label="Measurement & interpretation notes">
      <p className="text-xs">
        Distances calculated using intersection method from boundary measurements [up, right, down, left] (<a href={`${process.env.PUBLIC_URL}/METHOD.md`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline italic">see Method</a>)<br/>
        * Total path distance includes all intermediate movements, not just start-to-end displacement<br/>
        * All measurements in millimeters based on crack meter grid scale<br/>
        <br/>
        <strong>Structural Movement Interpretation (Normalized Data):</strong><br/>
        • <strong>All floors use consistent interpretation after normalization</strong> (<a href={`${process.env.PUBLIC_URL}/METHOD.md`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline italic">see Method</a>)<strong>:</strong><br/>
        • <strong>Horizontal movement:</strong> Left (−X) = crack closing, Right (+X) = crack expanding<br/>
        • <strong>Vertical movement:</strong> Up (−Y) = wall sinking, Down (+Y) = wall rising<br/>
        • <strong>Direct displacement</strong> shows net structural change from start to end position<br/>
        • P0 and P2 raw readings are inverted during normalization to match P1's crack meter orientation
      </p>
    </InfoDisclosure>
  );
};

export default InterpretationNotes;
