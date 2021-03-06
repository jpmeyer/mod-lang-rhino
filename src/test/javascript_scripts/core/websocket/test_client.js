/*
 * Copyright 2011-2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var tu = require('test_utils')
var vertx = require('vertx')

var server = vertx.createHttpServer();
var client = vertx.createHttpClient();
client.port(8080);

function testEchoBinary() {
  echo(true);
}

function testEchoText() {
  echo(false);
}

function echo(binary) {

  server.websocketHandler(function(ws) {

    tu.checkThread();

    ws.dataHandler(function(buff) {
      tu.checkThread();
      ws.write(buff);
    });

  });

  server.listen(8080, "0.0.0.0", function(serv) {
    var buff;
    var str;
    if (binary) {
      buff = tu.generateRandomBuffer(1000);
    } else {
      str = tu.randomUnicodeString(1000);
      buff = new vertx.Buffer(str);
    }

    client.connectWebsocket("/someurl", function(ws) {
      tu.checkThread();

      var received = new vertx.Buffer(0);

      ws.dataHandler(function(buff) {
        tu.checkThread();
        received.appendBuffer(buff);
        if (received.length() == buff.length()) {
          tu.azzert(tu.buffersEqual(buff, received));
          tu.testComplete();
        }
      });

      if (binary) {
        ws.writeBinaryFrame(buff) ;
      } else {
        ws.writeTextFrame(str);
      }
    });
  });
}

function testWriteFromConnectHandler() {

  server.websocketHandler(function(ws) {
    tu.checkThread();
    ws.writeTextFrame("foo");
  });

  server.listen(8080, "0.0.0.0", function(serv) {
    client.connectWebsocket("/someurl", function(ws) {
      tu.checkThread();
      ws.dataHandler(function(buff) {
        tu.checkThread();
        tu.azzert("foo" == buff.toString());
        tu.testComplete();
      });
    });
  });
}

function testClose() {

  server.websocketHandler(function(ws) {
    tu.checkThread();
    ws.dataHandler(function(buff) {
      ws.close();
    });
  });

  server.listen(8080, "0.0.0.0", function(serv) {
    client.connectWebsocket("/someurl", function(ws) {
      tu.checkThread();
      ws.closeHandler(function() {
        tu.testComplete();
      });
      ws.writeTextFrame("foo");
    });
  });
}

function testCloseFromConnectHandler() {

  server.websocketHandler(function(ws) {
    tu.checkThread();
    ws.close();
  });

  server.listen(8080, "0.0.0.0", function(serv) {
    client.connectWebsocket("/someurl", function(ws) {
      tu.checkThread();
      ws.closeHandler(function() {
        tu.testComplete();
      });
    });
  });
}

tu.registerTests(this);
tu.appReady();

function vertxStop() {
  client.close();
  server.close(function() {
    tu.unregisterAll();
    tu.appStopped();
  });
}

