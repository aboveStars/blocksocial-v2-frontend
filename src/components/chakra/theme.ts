import { extendTheme } from "@chakra-ui/react";

const activeLabelStyles = {
  transform: "scale(0.85) translateY(-24px)",
};

export const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: "black",
      },
    }),
  },
  components: {
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                ...activeLabelStyles,
              },
            },
            "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label":
              {
                ...activeLabelStyles,
              },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: "absolute",
              backgroundColor: "rgba(248,250,252,1)",
              pointerEvents: "none",
              mx: 3,
              px: 1,
              my: 2.5,
              transformOrigin: "left top",
            },
          },
        },
      },
    },
  },
});
