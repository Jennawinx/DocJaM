import React from "react";
import { Card } from "antd";

import "./index.css";

const Credits = () => {
  const credits = (
    <div className="content-page reading">
      <Card className="card-section">
        <h1>Credits</h1>
        <h3>Layout, Icons, Custom Elements</h3>
        <ul>
          <li>Layout and elements from by{" "}<a href="https://ant.design/" title="Antd">Antd</a>{" "}</li>
          <li>Icons by{" "}<a href="https://https://ant.design/components/icon//" title="@ant-design/icons">@ant-design/icons</a>{" "}</li>
          <li>Favicon converter <a href="https://favicon.io/favicon-converter/">https://favicon.io/favicon-converter/</a></li>
        </ul>
        <h3>HTML, CSS and Javascript code</h3>
        <ul>
          <li>
            What would I do without{" "}<a href="http://stackoverflow.com/">Stackoverflow</a>
            <ul>
              <li>Url query parsing for hash routing from <a href="https://stackoverflow.com/questions/27406607/javascript-get-url-parameter-with-hash">here</a></li>
              <li>Escaping HTML injection from <a href="https://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery">here</a></li>
            </ul>
          </li>
          <li>
            Apollo
            <ul>
              <li>
                Apollo Graphql Authorization{" "}
                <a href="https://www.apollographql.com/docs/react/v2/networking/network-layer/">
                  Apollo Graphql
                </a>
              </li>
              <li>
                Apollo Client Queries and Mutations{" "}
                <a href="https://www.apollographql.com/docs/react/v2/data/queries/">
                  Apollo Client
                </a>
              </li>
            </ul>
          </li>
          <li> Code Mirror Editor
            <ul>
              <li>Open source editor <a href="https://codemirror.net/">codemirror.net</a></li>
              <li>Multicursor guide by Yohei Seki from <a href="https://dev.to/yoheiseki/how-to-display-the-position-of-the-cursor-caret-of-another-client-with-codemirror-6p8">dev.to</a></li>
            </ul>
          </li>
          <li>
            Peer 2 peer connections
            <ul>
              <li>Active open sourced peer-2-peer library as of 2021 <a href="https://peerjs.com/">peerJS </a> (Thanks for being maintained) </li>
            </ul>
          </li>
          <li>
            Parsers
            <ul>
              <li>Simple text to markdown converter <a href="https://github.com/showdownjs/showdown">showdownJS</a></li>
            </ul>
          </li>
        </ul>
        <h3>Server</h3>
        <ul>
          <li>
            Apollo Graphql <a href="https://www.apollographql.com/docs/apollo-server/#:~:text=Apollo%20Server%20is%20an%20open,use%20data%20from%20any%20source.">Apollo</a>
          </li>
          <li>
            Express Graphql <a href="https://github.com/graphql/express-graphql">express-graphql</a>
          </li>
        </ul>
        <h3>Database</h3>
        <ul>
          <li>
            Database <a href="https://docs.mongodb.com/">MongoDB</a>
          </li>
          <li>
            Mongoose - MongoDB Middleware for Node.js{" "}
            <a href="https://mongoosejs.com/docs/">Mongoose</a>
          </li>
        </ul>
      </Card>
    </div>
  );
  return credits;
};

export default Credits;
