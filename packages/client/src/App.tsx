import { env } from "~/env";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FC, useState } from "react";
import { Separator } from "~/components/ui/separator";

const sendMessageSchema = z.object({
  action: z.literal("sendmessage"),
  username: z.string(),
  message: z.string(),
});
type Schema = z.infer<typeof sendMessageSchema>;
const initialSchema: Schema = {
  action: "sendmessage",
  username: "Nyx",
  message: "",
};

const receivedMessageSchema = z.object({
  username: z.string(),
  message: z.string(),
  timestamp: z.coerce.date(),
});
type MessageSchema = z.infer<typeof receivedMessageSchema>;

function App() {
  const [messages, setMessages] = useState<MessageSchema[]>([]);

  const { readyState, sendMessage } = useWebSocket(env.VITE_APP_API_URL, {
    shouldReconnect: () => true,
    onMessage: (event) => {
      const wsMessage = receivedMessageSchema.safeParse(JSON.parse(event.data));
      if (!wsMessage.success) {
        return;
      }

      setMessages((prev) => [...prev, wsMessage.data]);
    },
  });
  const isEnabled = readyState === ReadyState.OPEN;

  const form = useForm<Schema>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: initialSchema,
  });
  const onSubmit = (data: Schema) => {
    sendMessage(JSON.stringify(data));

    form.reset(initialSchema);
  };

  return (
    <section className="container max-w-2xl py-10 flex flex-col gap-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-end gap-4"
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Input placeholder="Your message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!isEnabled || form.formState.isSubmitting}
          >
            Submit
          </Button>
        </form>
      </Form>

      <Separator />

      <section className="flex flex-col gap-4">
        {messages.map((elem, idx) => (
          <Message
            key={[elem.username, elem.timestamp, idx.toString()].join("__")}
            {...elem}
          />
        ))}
      </section>
    </section>
  );
}

const Message: FC<MessageSchema> = (props) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">{props.username}: </p>
        <small className="text-sm font-medium leading-none">
          {props.message}
        </small>
      </div>

      <small className="text-sm font-medium leading-none">
        {props.timestamp.toLocaleString()}
      </small>
    </div>
  );
};

export default App;
