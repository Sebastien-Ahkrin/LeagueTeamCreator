import React from 'react';

import { Card } from './tailwind-ui';

interface PlayerCardProps {
  username: string;
}

export default function PlayerCard(props: PlayerCardProps) {
  const { username } = props;

  return (
    <Card>
      <Card.Header className="text-black">{username}</Card.Header>
      <Card.Footer className="text-black">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      </Card.Footer>
    </Card>
  );
}
